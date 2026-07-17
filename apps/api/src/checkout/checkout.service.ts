import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartsService: CartsService,
  ) {}

  async processCheckout(
    userId: string,
    data: { shippingAddressId?: string; notes?: string; paymentMethod?: 'COD' | 'ONLINE' },
  ) {
    // 1. Get the current cart with totals calculated
    const cartData = await this.cartsService.getCart(userId);

    if (cartData.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Validate stock for all items
    for (const item of cartData.items) {
      if (item.variant) {
        if (item.variant.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for variant ${item.variant.sku}`);
        }
      } else {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for product ${item.product.name}`);
        }
      }
    }

    // 3. Generate a unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 4. Create the Order in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal: cartData.summary.subtotal,
          tax: cartData.summary.tax,
          shipping: cartData.summary.shipping,
          discount: cartData.summary.discount,
          total: cartData.summary.total,
          couponId: cartData.coupon?.id || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod || 'COD',
          shippingAddressId: data.shippingAddressId || null,
          notes: data.notes || null,
        },
      });

      // Create order items and decrement stock
      for (const item of cartData.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            measurementProfileId: item.measurementProfileId || null,
          },
        });

        // Decrement stock
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // If coupon used, increment usage count and log
      if (cartData.coupon) {
        await tx.coupon.update({
          where: { id: cartData.coupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUser.create({
          data: {
            couponId: cartData.coupon.id,
            userId,
          },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cartData.id } });
      await tx.cart.update({ where: { id: cartData.id }, data: { couponId: null } });

      return newOrder;
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Order created successfully',
    };
  }
}
