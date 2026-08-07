import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  hashToken,
  generateOtp,
} from "@/lib/auth-server";
import { sendRegistrationOtp } from "@/lib/mailer";
import {
  successResponse,
  errorResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { OtpType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();

    if (!dto.email) {
      return errorResponse("Email is required for registration");
    }

    const hashedPassword = await hashPassword(dto.password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { countryCode: dto.countryCode, mobile: dto.mobile },
        ],
      },
    });

    if (existingUser) {
      return conflictResponse("User already exists");
    }

    const user = await prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        password: hashedPassword,
        role: { connect: { slug: "customer" } },
      },
    });

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
      await sendRegistrationOtp(dto.email, otp);
    } catch (emailError) {
      console.error("Error sending registration email:", emailError);
    }

    const { password, ...userWithoutPassword } = user;

    return successResponse({
      message: "User registered successfully. Please verify your email.",
      requiresVerification: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Register error:", error);
    return serverErrorResponse("Registration failed");
  }
}
