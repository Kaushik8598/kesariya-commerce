import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const profile = await prisma.measurementProfile.findFirst({ where: { id, userId } });
    if (!profile) return notFoundResponse("Measurement profile not found");

    const updated = await prisma.$transaction(async (tx) => {
      await tx.measurementProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.measurementProfile.update({
        where: { id },
        data: { isDefault: true },
        include: { values: true },
      });
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Measurement set default error:", error);
    return serverErrorResponse();
  }
}
