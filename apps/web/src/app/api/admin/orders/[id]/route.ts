import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dto = await request.json();
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFoundResponse("Order not found");

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status as any }),
        ...(dto.paymentStatus && { paymentStatus: dto.paymentStatus as any }),
      },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFoundResponse("Order not found");
    await prisma.order.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
