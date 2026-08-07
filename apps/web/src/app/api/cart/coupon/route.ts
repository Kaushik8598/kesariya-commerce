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
    const { code } = await request.json();

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return notFoundResponse("Cart not found");

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) return errorResponse("Invalid or expired coupon");

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) return errorResponse("Coupon is not active yet");
    if (coupon.endDate && coupon.endDate < now) return errorResponse("Coupon has expired");
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return errorResponse("Coupon usage limit reached");

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    return successResponse({ success: true, coupon });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return notFoundResponse("Cart not found");

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error("Remove coupon error:", error);
    return serverErrorResponse();
  }
}
