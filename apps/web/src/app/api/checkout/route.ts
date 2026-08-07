import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

// Re-use cart calculation from cart route
async function getCartData(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
          measurementProfile: { include: { values: true } },
        },
      },
      coupon: true,
    },
  });

  if (!cart) return null;

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

  return {
    ...cart,
    items,
    summary: {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: pricesIncludeGst
        ? Number((netSubtotal + shipping).toFixed(2))
        : Number((netSubtotal + tax + shipping).toFixed(2)),
    },
  };
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const data = await request.json();
    const cartData = await getCartData(userId);

    if (!cartData || cartData.items.length === 0) {
      return errorResponse("Cart is empty");
    }

    // Validate stock
    for (const item of cartData.items) {
      if (item.variant) {
        if (item.variant.stock < item.quantity) {
          return errorResponse(`Not enough stock for variant ${item.variant.sku}`);
        }
      } else {
        if (item.product.stock < item.quantity) {
          return errorResponse(`Not enough stock for product ${item.product.name}`);
        }
      }
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.$transaction(async (tx) => {
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
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: data.paymentMethod || "COD",
          shippingAddressId: data.shippingAddressId || null,
          notes: data.notes || null,
        },
      });

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

      if (cartData.coupon) {
        await tx.coupon.update({
          where: { id: cartData.coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUser.create({
          data: { couponId: cartData.coupon.id, userId },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cartData.id } });
      await tx.cart.update({ where: { id: cartData.id }, data: { couponId: null } });

      return newOrder;
    });

    return successResponse({
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return serverErrorResponse();
  }
}
