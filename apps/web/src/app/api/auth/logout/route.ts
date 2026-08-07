import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareToken } from "@/lib/auth-server";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return unauthorizedResponse();

    const { refreshToken } = await request.json();

    const tokens = await prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    let tokenId: string | null = null;
    for (const token of tokens) {
      const matched = await compareToken(refreshToken, token.tokenHash);
      if (matched) {
        tokenId = token.id;
        break;
      }
    }

    if (!tokenId) {
      return unauthorizedResponse("Invalid refresh token");
    }

    await prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });

    return successResponse({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return serverErrorResponse();
  }
}
