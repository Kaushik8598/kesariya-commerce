import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { productId } = await params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return notFoundResponse("Product not found");

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      return successResponse({
        success: true,
        message: "Product removed from wishlist",
        isWishlisted: false,
      });
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
      return successResponse({
        success: true,
        message: "Product added to wishlist",
        isWishlisted: true,
      });
    }
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return serverErrorResponse();
  }
}
