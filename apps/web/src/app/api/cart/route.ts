import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

async function getCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
          measurementProfile: { include: { values: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      coupon: true,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
            measurementProfile: { include: { values: true } },
          },
        },
        coupon: true,
      },
    });
  }

  return calculateCartTotals(cart);
}

async function calculateCartTotals(cart: any) {
  let subtotal = 0;
  const items = cart.items.map((item: any) => {
    const price = item.variant
      ? Number(item.variant.price)
      : Number(item.product.salePrice || item.product.basePrice);
    const total = price * item.quantity;
    subtotal += total;
    return { ...item, price, total };
  });

  let discount = 0;
  if (cart.coupon) {
    if (Number(cart.coupon.minOrderAmount) > 0 && subtotal < Number(cart.coupon.minOrderAmount)) {
      discount = 0;
    } else if (cart.coupon.type === "PERCENTAGE") {
      discount = subtotal * (Number(cart.coupon.value) / 100);
      if (Number(cart.coupon.maxDiscount) > 0 && discount > Number(cart.coupon.maxDiscount)) {
        discount = Number(cart.coupon.maxDiscount);
      }
    } else {
      discount = Number(cart.coupon.value);
    }
  }
  if (discount > subtotal) discount = subtotal;

  const settings = await prisma.storeSetting.findMany({
    where: { key: { in: ["shipping", "tax"] } },
  });
  const shippingSetting = (settings.find((s) => s.key === "shipping")?.value as any) || {};
  const taxSetting = (settings.find((s) => s.key === "tax")?.value as any) || {};

  const flatShippingFee = Number(shippingSetting.flatShippingFee) || 0;
  const freeShippingThreshold = Number(shippingSetting.freeShippingThreshold) || 0;
  let shipping = flatShippingFee;
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) shipping = 0;

  const apparelGstRate = Number(taxSetting.apparelGstRate) || 0;
  const pricesIncludeGst = Boolean(taxSetting.pricesIncludeGst);
  const netSubtotal = subtotal - discount;
  let tax = 0;
  if (apparelGstRate > 0) {
    tax = pricesIncludeGst
      ? netSubtotal - netSubtotal / (1 + apparelGstRate / 100)
      : (netSubtotal * apparelGstRate) / 100;
  }

  tax = Number(tax.toFixed(2));
  shipping = Number(shipping.toFixed(2));
  discount = Number(discount.toFixed(2));
  subtotal = Number(subtotal.toFixed(2));
  const total = pricesIncludeGst
    ? Number((netSubtotal + shipping).toFixed(2))
    : Number((netSubtotal + tax + shipping).toFixed(2));

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    coupon: cart.coupon,
    summary: { subtotal, discount, tax, shipping, total, pricesIncludeGst, apparelGstRate, freeShippingThreshold, flatShippingFee },
  };
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const cart = await getCart(userId);
    return successResponse(cart);
  } catch (error) {
    console.error("Cart GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { action, productId, variantId, itemId, quantity, couponCode, measurementProfileId } = await request.json();

    if (action === "add") {
      let cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) cart = await prisma.cart.create({ data: { userId } });

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return notFoundResponse("Product not found");

      if (variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant) return notFoundResponse("Variant not found");
        if (variant.stock < (quantity || 1)) return errorResponse("Not enough stock");
      } else {
        if (product.stock < (quantity || 1)) return errorResponse("Not enough stock");
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, variantId: variantId || null, measurementProfileId: measurementProfileId || null },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + (quantity || 1) },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, variantId: variantId || null, measurementProfileId: measurementProfileId || null, quantity: quantity || 1 },
        });
      }
    } else if (action === "updateQuantity") {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return notFoundResponse("Cart not found");
      if ((quantity || 0) <= 0) {
        await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
      } else {
        const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
        if (!item) return notFoundResponse("Cart item not found");
        await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
      }
    } else if (action === "removeItem") {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return notFoundResponse("Cart not found");
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    } else if (action === "applyCoupon") {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return notFoundResponse("Cart not found");
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon || !coupon.isActive) return errorResponse("Invalid or expired coupon");
      const now = new Date();
      if (coupon.startDate && coupon.startDate > now) return errorResponse("Coupon is not active yet");
      if (coupon.endDate && coupon.endDate < now) return errorResponse("Coupon has expired");
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return errorResponse("Coupon usage limit reached");
      await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });
    } else if (action === "removeCoupon") {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return notFoundResponse("Cart not found");
      await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    } else if (action === "clear") {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
      }
      return successResponse({ success: true });
    }

    const updatedCart = await getCart(userId);
    return successResponse(updatedCart);
  } catch (error) {
    console.error("Cart POST error:", error);
    return serverErrorResponse();
  }
}
