import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) return notFoundResponse("Address not found");

    const data = await request.json();
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const updated = await prisma.address.update({ where: { id }, data });
    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) return notFoundResponse("Address not found");
    await prisma.address.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
