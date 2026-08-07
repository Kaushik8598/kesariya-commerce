import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { productId } = await params;
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return successResponse(!!item);
  } catch (error) {
    console.error("Wishlist check error:", error);
    return serverErrorResponse();
  }
}
