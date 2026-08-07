import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status === "APPROVED") where.isApproved = true;
    if (status === "PENDING") where.isApproved = false;

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, approvedCount, pendingCount, avgRatingResult, data] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
      }),
    ]);

    return successResponse({
      stats: {
        totalReviews: total,
        approvedReviews: approvedCount,
        pendingReviews: pendingCount,
        averageRating: Number(avgRatingResult._avg.rating || 0).toFixed(1),
      },
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return serverErrorResponse();
  }
}
