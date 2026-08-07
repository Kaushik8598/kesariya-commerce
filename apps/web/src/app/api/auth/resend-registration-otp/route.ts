import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth-server";
import { sendRegistrationOtp } from "@/lib/mailer";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { OtpType } from "@prisma/client";

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
    if (!user.email) return errorResponse("No email address linked to this account");
    if (user.isVerified) return errorResponse("Account is already verified");

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        otpHash: otp,
        type: OtpType.REGISTER,
        expiresAt: expiry,
      },
    });

    try {
      await sendRegistrationOtp(user.email, otp);
    } catch (e) {
      console.error("Error sending registration email:", e);
    }

    return successResponse({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return serverErrorResponse();
  }
}
