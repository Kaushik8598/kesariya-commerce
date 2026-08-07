import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return successResponse(brands);
  } catch (error) {
    console.error("Brands GET error:", error);
    return serverErrorResponse();
  }
}
