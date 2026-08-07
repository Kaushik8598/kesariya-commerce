import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth-server";
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

    if (!user) return unauthorizedResponse("User not found");

    const verification = await prisma.otpVerification.findFirst({
      where: {
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        type: OtpType.REGISTER,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (
      !verification ||
      verification.otpHash !== dto.otp ||
      verification.expiresAt < new Date()
    ) {
      return errorResponse("Invalid or expired OTP");
    }

    await prisma.$transaction([
      prisma.otpVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

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

    const { password, ...userWithoutPassword } = user;
    return successResponse({
      message: "Account verified successfully",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    return serverErrorResponse();
  }
}
