import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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

    return successResponse({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return serverErrorResponse();
  }
}
