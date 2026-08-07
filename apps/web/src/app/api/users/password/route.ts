import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { comparePassword, hashPassword } from "@/lib/auth-server";

export async function PATCH(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { currentPassword, newPassword } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) return unauthorizedResponse("User not found");

    if (currentPassword) {
      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) return errorResponse("Incorrect current password");
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    return serverErrorResponse();
  }
}
