import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, description: true, type: true, value: true,
        minOrderAmount: true, maxDiscount: true, startDate: true, endDate: true,
      },
    });
    return successResponse(coupons);
  } catch (error) {
    console.error("Coupons public error:", error);
    return serverErrorResponse();
  }
}
