import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dto = await request.json();

    const page = await prisma.cmsPage.findUnique({ where: { id } });
    if (!page) return notFoundResponse("CMS page not found");

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await prisma.cmsPage.findUnique({ where: { slug: dto.slug } });
      if (existing) {
        return errorResponse(`CMS page with slug "${dto.slug}" already exists`);
      }
    }

    const updated = await prisma.cmsPage.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.content && { content: dto.content }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Admin CMS PATCH error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await prisma.cmsPage.findUnique({ where: { id } });
    if (!page) return notFoundResponse("CMS page not found");

    await prisma.cmsPage.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    console.error("Admin CMS DELETE error:", error);
    return serverErrorResponse();
  }
}
