import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phoneCode: true, iso2: true },
    });
    return successResponse(countries);
  } catch (error) {
    console.error("Locations countries error:", error);
    return serverErrorResponse();
  }
}
