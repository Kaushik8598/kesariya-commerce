import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-server";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();

    const user = await prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
    });

    if (!user) return unauthorizedResponse("User not found");

    if (
      user.forgotPasswordOtp !== dto.otp ||
      !user.forgotPasswordOtpExpiry ||
      user.forgotPasswordOtpExpiry < new Date()
    ) {
      return unauthorizedResponse("Invalid or expired OTP");
    }

    const hashedPassword = await hashPassword(dto.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forgotPasswordOtp: null,
        forgotPasswordOtpExpiry: null,
        forgotPasswordOtpSentAt: null,
      },
    });

    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return serverErrorResponse();
  }
}
