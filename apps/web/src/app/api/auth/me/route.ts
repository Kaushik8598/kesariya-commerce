import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      countryCode: true,
      mobile: true,
      avatar: true,
      isVerified: true,
      isActive: true,
      role: { select: { slug: true, name: true } },
    },
  });

  if (!user) {
    return unauthorizedResponse("User not found");
  }

  return successResponse(user);
}
