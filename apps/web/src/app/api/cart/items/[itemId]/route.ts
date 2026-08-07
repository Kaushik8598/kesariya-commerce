import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { itemId } = await params;
    const { quantity } = await request.json();

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return notFoundResponse("Cart not found");

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    } else {
      const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
      if (!item) return notFoundResponse("Cart item not found");
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Cart item PATCH error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { itemId } = await params;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return notFoundResponse("Cart not found");

    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return successResponse({ success: true });
  } catch (error) {
    console.error("Cart item DELETE error:", error);
    return serverErrorResponse();
  }
}
