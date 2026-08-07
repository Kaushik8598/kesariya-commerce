import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth-server";
import { sendForgotPasswordOtp } from "@/lib/mailer";
import {
  successResponse,
  errorResponse,
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

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    if (!user.email) {
      return errorResponse("No email address linked to this account");
    }

    if (
      user.forgotPasswordOtpSentAt &&
      Date.now() - user.forgotPasswordOtpSentAt.getTime() < 30_000
    ) {
      return unauthorizedResponse(
        "Please wait 30 seconds before requesting another OTP"
      );
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordOtp: otp,
        forgotPasswordOtpExpiry: expiry,
        forgotPasswordOtpSentAt: new Date(),
      },
    });

    try {
      await sendForgotPasswordOtp(user.email, otp);
    } catch {
      return serverErrorResponse(
        "Failed to send OTP email. Please try again later."
      );
    }

    return successResponse({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return serverErrorResponse();
  }
}
