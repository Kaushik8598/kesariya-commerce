import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stock } = await request.json();

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return notFoundResponse("Product not found");

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: Math.max(0, stock) },
      include: {
        category: { select: { name: true } },
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Admin stock update error:", error);
    return serverErrorResponse();
  }
}
