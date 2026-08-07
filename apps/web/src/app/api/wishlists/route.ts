import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse,
} from "@/lib/api-response";

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

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { productId } = await request.json();
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return notFoundResponse("Product not found");

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return successResponse({ message: "Product removed from wishlist", isWishlisted: false });
    } else {
      await prisma.wishlistItem.create({ data: { userId, productId } });
      return successResponse({ message: "Product added to wishlist", isWishlisted: true });
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return serverErrorResponse();
  }
}
