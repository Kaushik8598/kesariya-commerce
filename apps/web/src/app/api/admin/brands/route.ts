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

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.brand.count({ where }),
    ]);

    return successResponse({ data: brands, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } });
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await prisma.brand.findFirst({ where: { slug } });
    if (existing) return errorResponse("Brand with this slug already exists");

    const brand = await prisma.brand.create({
      data: { name: dto.name, slug, description: dto.description || "", logo: dto.logo || null, isActive: dto.isActive ?? true },
    });
    return successResponse(brand);
  } catch (error) {
    return serverErrorResponse();
  }
}
