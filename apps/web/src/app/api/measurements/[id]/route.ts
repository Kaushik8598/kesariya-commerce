import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const profile = await prisma.measurementProfile.findFirst({
      where: { id, userId },
      include: { values: true },
    });
    if (!profile) return notFoundResponse("Measurement profile not found");
    return successResponse(profile);
  } catch (error) {
    return serverErrorResponse();
  }
}

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

    const { name, isDefault, values } = await request.json();
    if (isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (values) await tx.measurementValue.deleteMany({ where: { profileId: id } });
      return tx.measurementProfile.update({
        where: { id },
        data: {
          name, ...(isDefault !== undefined && { isDefault }),
          ...(values && { values: { create: values.map((v: any) => ({ type: v.type, value: v.value, customName: v.customName })) } }),
        },
        include: { values: true },
      });
    });
    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { id } = await params;
    const profile = await prisma.measurementProfile.findFirst({ where: { id, userId } });
    if (!profile) return notFoundResponse("Measurement profile not found");
    await prisma.measurementProfile.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
