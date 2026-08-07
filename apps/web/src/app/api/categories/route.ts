import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

async function getAverageRatings(productIds: string[]): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
  });
  return ratings.reduce((acc, r) => {
    acc[r.productId] = Number((r._avg.rating || 0).toFixed(1));
    return acc;
  }, {} as Record<string, number>);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get("tree") === "true";

    const categories = await prisma.category.findMany({
      where: { isActive: true, ...(tree ? { parentId: null } : {}) },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: { where: { status: "ACTIVE" } } } },
          },
        },
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(categories);
  } catch (error) {
    console.error("Categories GET error:", error);
    return serverErrorResponse();
  }
}
