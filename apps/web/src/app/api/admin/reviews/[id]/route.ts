import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return notFoundResponse("Review not found");

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: !review.isApproved },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Admin review toggle approval error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return notFoundResponse("Review not found");

    await prisma.review.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    console.error("Admin review delete error:", error);
    return serverErrorResponse();
  }
}
