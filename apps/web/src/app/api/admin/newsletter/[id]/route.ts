import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!item) return notFoundResponse("Subscriber not found");

    await prisma.newsletterSubscriber.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    console.error("Admin newsletter subscriber DELETE error:", error);
    return serverErrorResponse();
  }
}
