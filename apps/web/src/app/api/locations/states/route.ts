import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId") || undefined;

    const states = await prisma.state.findMany({
      where: { isActive: true, ...(countryId ? { countryId } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return successResponse(states);
  } catch (error) {
    console.error("Locations states error:", error);
    return serverErrorResponse();
  }
}
