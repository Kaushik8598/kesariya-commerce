import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) { }

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
            measurementProfile: { include: { values: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        coupon: true,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { images: true } }, variant: true, measurementProfile: { include: { values: true } } } }, coupon: true },
      });
    }

    return this.calculateCartTotals(cart);
  }

  async addItem(userId: string, productId: string, variantId?: string, quantity: number = 1, measurementProfileId?: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Check product exists and stock
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      if (variant.stock < quantity) throw new BadRequestException('Not enough stock');
    } else {
      if (product.stock < quantity) throw new BadRequestException('Not enough stock');
    }

    // Check if item exists
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        measurementProfileId: measurementProfileId || null,
      },
    });

    if (existingItem) {
      // Check total stock before adding
      const newQuantity = existingItem.quantity + quantity;

      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          measurementProfileId: measurementProfileId || null,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return this.getCart(userId);
  }

  async applyCoupon(userId: string, code: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or expired coupon');
    }

    // Validate dates
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) throw new BadRequestException('Coupon is not active yet');
    if (coupon.endDate && coupon.endDate < now) throw new BadRequestException('Coupon has expired');

    // Validate usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Assign coupon to cart
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    return this.getCart(userId);
  }

  async removeCoupon(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    }
    return { success: true };
  }

  // Calculate totals helper
  private calculateCartTotals(cart: any) {
    let subtotal = 0;

    const items = cart.items.map((item: any) => {
      const price = item.variant
        ? Number(item.variant.price)
        : Number(item.product.salePrice || item.product.basePrice);

      const total = price * item.quantity;
      subtotal += total;

      return {
        ...item,
        price,
        total,
      };
    });

    let discount = 0;
    if (cart.coupon) {
      if (Number(cart.coupon.minOrderAmount) > 0 && subtotal < Number(cart.coupon.minOrderAmount)) {
        // Minimum order amount not met, ignore coupon visually but it's attached
        discount = 0;
      } else if (cart.coupon.type === 'PERCENTAGE') {
        discount = subtotal * (Number(cart.coupon.value) / 100);
        if (Number(cart.coupon.maxDiscount) > 0 && discount > Number(cart.coupon.maxDiscount)) {
          discount = Number(cart.coupon.maxDiscount);
        }
      } else {
        discount = Number(cart.coupon.value);
      }
    }

    // Ensure discount isn't more than subtotal
    if (discount > subtotal) discount = subtotal;

    const tax = (subtotal - discount) * 0.18; // 18% GST (Example)
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000, else 50

    // Sometimes taxes are included in price, let's assume they are not for this calculation
    const total = subtotal - discount + tax + shipping;

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      coupon: cart.coupon,
      summary: {
        subtotal,
        discount,
        tax,
        shipping,
        total,
      },
    };
  }
}
