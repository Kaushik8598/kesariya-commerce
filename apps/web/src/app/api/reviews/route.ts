import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse, unauthorizedResponse, notFoundResponse,
  conflictResponse, errorResponse, serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (slug) {
      const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
      if (!product) return notFoundResponse("Product not found");
      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { productId: product.id, isApproved: true },
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          skip: Math.max(0, (parseInt(searchParams.get("page") || "1") - 1)) * parseInt(searchParams.get("limit") || "10"),
          take: parseInt(searchParams.get("limit") || "10"),
        }),
        prisma.review.count({ where: { productId: product.id, isApproved: true } }),
      ]);
      return successResponse({ reviews, totalReviews: total });
    }
    // My reviews
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: { product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);
    return successResponse({ data: reviews, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { slug, rating, title, comment } = await request.json();
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) return notFoundResponse("Product not found");

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: product.id, userId } },
    });
    if (existing) return conflictResponse("You have already reviewed this product");

    const review = await prisma.review.create({
      data: { productId: product.id, userId, rating, title, comment },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    return successResponse(review);
  } catch (error) {
    console.error("Review POST error:", error);
    return serverErrorResponse();
  }
}
