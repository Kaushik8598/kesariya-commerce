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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFoundResponse("User not found");

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(dto.roleId && { roleId: dto.roleId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: { id: true, firstName: true, lastName: true, email: true, isActive: true, role: { select: { id: true, name: true, slug: true } } },
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFoundResponse("User not found");
    await prisma.user.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
