import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId") || undefined;

    const cities = await prisma.city.findMany({
      where: { isActive: true, ...(stateId ? { stateId } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return successResponse(cities);
  } catch (error) {
    console.error("Locations cities error:", error);
    return serverErrorResponse();
  }
}
