import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

async function getAverageRatings(
  productIds: string[]
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
  });
  return ratings.reduce(
    (acc, r) => {
      acc[r.productId] = Number((r._avg.rating || 0).toFixed(1));
      return acc;
    },
    {} as Record<string, number>
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!product) return successResponse([]);

    const related = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const productIds = related.map((p) => p.id);
    const ratings = await getAverageRatings(productIds);

    return successResponse(
      related.map((p) => ({ ...p, avgRating: ratings[p.id] || 0 }))
    );
  } catch (error) {
    console.error("Related products error:", error);
    return serverErrorResponse();
  }
}
