import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { productId, variantId, quantity = 1, measurementProfileId } = await request.json();

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return notFoundResponse("Product not found");

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return notFoundResponse("Variant not found");
      if (variant.stock < quantity) return errorResponse("Not enough stock");
    } else {
      if (product.stock < quantity) return errorResponse("Not enough stock");
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        measurementProfileId: measurementProfileId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          measurementProfileId: measurementProfileId || null,
          quantity,
        },
      });
    }

    return successResponse({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Cart items POST error:", error);
    return serverErrorResponse();
  }
}
