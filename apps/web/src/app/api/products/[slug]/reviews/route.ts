import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) return notFoundResponse("Product not found");

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: product.id, isApproved: true },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: { productId: product.id, isApproved: true },
      }),
    ]);

    const breakdown = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId: product.id, isApproved: true },
      _count: true,
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: breakdown.find((b) => b.rating === star)?._count || 0,
    }));

    const avgResult = await prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
    });

    return successResponse({
      reviews,
      avgRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      totalReviews: total,
      ratingBreakdown,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Product reviews error:", error);
    return serverErrorResponse();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { slug } = await params;
    const dto = await request.json();

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) return notFoundResponse("Product not found");

    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId,
        },
      },
    });

    if (existing) return conflictResponse("You have already reviewed this product");

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    return successResponse(review);
  } catch (error) {
    console.error("Create review error:", error);
    return serverErrorResponse();
  }
}
