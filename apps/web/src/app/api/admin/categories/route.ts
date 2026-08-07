import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.isActive = status === "ACTIVE";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: { parent: { select: { name: true } }, _count: { select: { products: true, children: true } } },
        orderBy: { sortOrder: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return successResponse({
      data: categories,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await prisma.category.findFirst({ where: { slug } });
    if (existing) return errorResponse("Category with this slug already exists");

    const category = await prisma.category.create({
      data: {
        name: dto.name, slug, description: dto.description || "",
        parentId: dto.parentId || null, image: dto.image || null,
        sortOrder: dto.sortOrder ?? 0, isActive: dto.isActive ?? true,
      },
      include: { parent: { select: { name: true } } },
    });
    return successResponse(category);
  } catch (error) {
    return serverErrorResponse();
  }
}
