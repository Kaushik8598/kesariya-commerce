import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            _count: { select: { reviews: { where: { isApproved: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(items.map((item) => item.product));
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return serverErrorResponse();
  }
}
