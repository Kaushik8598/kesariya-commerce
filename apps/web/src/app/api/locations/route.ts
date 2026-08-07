import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");
    const stateId = searchParams.get("stateId");

    if (stateId) {
      const cities = await prisma.city.findMany({
        where: { stateId, isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
      return successResponse(cities);
    }

    if (countryId) {
      const states = await prisma.state.findMany({
        where: { countryId, isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
      return successResponse(states);
    }

    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phoneCode: true, iso2: true },
    });
    return successResponse(countries);
  } catch (error) {
    console.error("Locations error:", error);
    return serverErrorResponse();
  }
}
