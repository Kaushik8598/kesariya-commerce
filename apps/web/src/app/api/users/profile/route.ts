import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        countryCode: true, mobile: true, avatar: true,
        role: { select: { slug: true, name: true } },
      },
    });
    if (!user) return notFoundResponse("User not found");
    return successResponse(user);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();
  try {
    const data = await request.json();
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        countryCode: true, mobile: true, avatar: true,
        role: { select: { slug: true, name: true } },
      },
    });
    return successResponse(user);
  } catch (error) {
    return serverErrorResponse();
  }
}
