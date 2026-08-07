import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || undefined;
    const stockFilter = searchParams.get("stockFilter") || undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (stockFilter === "OUT") {
      where.stock = 0;
    } else if (stockFilter === "LOW") {
      where.stock = { gt: 0, lte: 10 };
    } else if (stockFilter === "IN_STOCK") {
      where.stock = { gt: 10 };
    }

    const [products, total, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: { select: { id: true, sku: true, size: true, color: true, stock: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { stock: { gt: 10 } } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

    return successResponse({
      data: products,
      stats: {
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return serverErrorResponse();
  }
}
