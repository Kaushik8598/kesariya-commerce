import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashToken,
  compareToken,
} from "@/lib/auth-server";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return unauthorizedResponse("Refresh token required");
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return unauthorizedResponse("Invalid refresh token");
    }

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: decoded.sub, revokedAt: null },
    });

    let matchedToken = null;
    for (const token of tokens) {
      const isValid = await compareToken(refreshToken, token.tokenHash);
      if (isValid) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      return unauthorizedResponse("Invalid refresh token");
    }

    if (matchedToken.expiresAt < new Date()) {
      return unauthorizedResponse("Refresh token expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { role: true },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens
    const newAccessToken = await signAccessToken({
      sub: user.id,
      role: user.role.slug,
    });
    const newRefreshToken = await signRefreshToken({
      sub: user.id,
      role: user.role.slug,
    });

    const tokenHash = await hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return successResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return serverErrorResponse();
  }
}
