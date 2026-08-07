import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse, errorResponse, notFoundResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.isActive = status === "ACTIVE";
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [coupons, total, activeCount, totalRedemptionsAgg] = await Promise.all([
      prisma.coupon.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.coupon.count({ where }),
      prisma.coupon.count({ where: { ...where, isActive: true } }),
      prisma.coupon.aggregate({ _sum: { usedCount: true } }),
    ]);

    return successResponse({
      data: coupons,
      stats: { activeCount, totalRedemptions: totalRedemptionsAgg._sum.usedCount || 0 },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const existing = await prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) return errorResponse("Coupon code already exists");

    const coupon = await prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(), description: dto.description, type: dto.type,
        value: dto.value, minOrderAmount: dto.minOrderAmount, maxDiscount: dto.maxDiscount,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        usageLimit: dto.usageLimit, isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
    return successResponse(coupon);
  } catch (error) {
    return serverErrorResponse();
  }
}
