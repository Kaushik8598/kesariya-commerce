import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const profiles = await prisma.measurementProfile.findMany({
      where: { userId },
      include: { values: true },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(profiles);
  } catch (error) {
    console.error("Measurements GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const { name, isDefault, values } = await request.json();
    if (isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    const count = await prisma.measurementProfile.count({ where: { userId } });
    const shouldBeDefault = count === 0 ? true : isDefault;

    const profile = await prisma.measurementProfile.create({
      data: {
        userId, name, isDefault: shouldBeDefault,
        values: { create: values?.map((v: any) => ({ type: v.type, value: v.value, customName: v.customName })) || [] },
      },
      include: { values: true },
    });
    return successResponse(profile);
  } catch (error) {
    console.error("Measurements POST error:", error);
    return serverErrorResponse();
  }
}
