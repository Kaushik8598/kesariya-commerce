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
    const item = await prisma.testimonial.findUnique({ where: { id } });
    if (!item) return notFoundResponse("Testimonial not found");

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.product !== undefined && { product: dto.product }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Admin testimonial PATCH error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.testimonial.findUnique({ where: { id } });
    if (!item) return notFoundResponse("Testimonial not found");

    await prisma.testimonial.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    console.error("Admin testimonial DELETE error:", error);
    return serverErrorResponse();
  }
}
