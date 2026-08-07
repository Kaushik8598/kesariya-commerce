import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      include: {
        country: { select: { name: true, phoneCode: true } },
        state: { select: { name: true } },
        city: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(addresses);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const data = await request.json();
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...data, userId } });
    return successResponse(address);
  } catch (error) {
    return serverErrorResponse();
  }
}
