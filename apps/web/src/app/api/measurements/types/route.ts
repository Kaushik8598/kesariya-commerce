import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { MeasurementType } from "@prisma/client";

export async function GET(_request: NextRequest) {
  const types = Object.values(MeasurementType).map((value) => ({
    value,
    label: value
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" "),
  }));
  return successResponse(types);
}
