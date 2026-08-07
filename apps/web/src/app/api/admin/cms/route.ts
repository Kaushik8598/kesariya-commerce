import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [pages, total, publishedCount] = await Promise.all([
      prisma.cmsPage.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cmsPage.count({ where }),
      prisma.cmsPage.count({ where: { isPublished: true } }),
    ]);

    return successResponse({
      data: pages,
      stats: { publishedCount },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("Admin CMS GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.cmsPage.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse(`CMS page with slug "${slug}" already exists`);
    }

    const page = await prisma.cmsPage.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      },
    });

    return successResponse(page);
  } catch (error) {
    console.error("Admin CMS POST error:", error);
    return serverErrorResponse();
  }
}
