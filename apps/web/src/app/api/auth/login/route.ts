import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  hashToken,
  generateOtp,
} from "@/lib/auth-server";
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
      include: { role: true },
    });

    if (!user) {
      return unauthorizedResponse("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(dto.password, user.password!);
    if (!isPasswordValid) {
      return unauthorizedResponse("Invalid credentials");
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.otpVerification.create({
        data: {
          countryCode: user.countryCode,
          mobile: user.mobile,
          otpHash: otp,
          type: OtpType.REGISTER,
          expiresAt: expiry,
        },
      });
      if (user.email) {
        try {
          await sendRegistrationOtp(user.email, otp);
        } catch (e) {
          console.error("Error sending registration email during login:", e);
        }
      }
      return successResponse({
        success: false,
        message:
          "Please verify your account to login. A new OTP has been sent to your email.",
        requiresVerification: true,
      });
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      role: user.role.slug,
    });
    const refreshToken = await signRefreshToken({
      sub: user.id,
      role: user.role.slug,
    });

    const tokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password, ...userWithoutPassword } = user;
    return successResponse({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse("Login failed");
  }
}
