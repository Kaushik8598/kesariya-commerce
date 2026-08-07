import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page || !page.isPublished) return notFoundResponse("Page not found");
    return successResponse(page);
  } catch (error) {
    console.error("CMS page error:", error);
    return serverErrorResponse();
  }
}
