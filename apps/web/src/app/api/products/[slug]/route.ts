import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    });

    if (!product || product.status !== "ACTIVE") {
      return notFoundResponse("Product not found");
    }

    const [avgResult, breakdown] = await Promise.all([
      prisma.review.aggregate({
        where: { productId: product.id, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId: product.id, isApproved: true },
        _count: true,
      }),
    ]);

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: breakdown.find((b) => b.rating === star)?._count || 0,
    }));

    return successResponse({
      ...product,
      avgRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      totalReviews: avgResult._count,
      ratingBreakdown,
    });
  } catch (error) {
    console.error("Product by slug error:", error);
    return serverErrorResponse();
  }
}
