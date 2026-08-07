import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

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
    const limit = parseInt(searchParams.get("limit") || "8");

    const [featured, newArrivals] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: { where: { isApproved: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isNewArrival: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: { where: { isApproved: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const allProductIds = [
      ...featured.map((p) => p.id),
      ...newArrivals.map((p) => p.id),
    ];
    const ratings = await getAverageRatings(allProductIds);

    return successResponse(
      featured.map((p) => ({ ...p, avgRating: ratings[p.id] || 0 }))
    );
  } catch (error) {
    console.error("Featured products error:", error);
    return serverErrorResponse();
  }
}
