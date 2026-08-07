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
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return notFoundResponse("Brand not found");
    const updated = await prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
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
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return notFoundResponse("Brand not found");
    await prisma.brand.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
