import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const dbSettings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, any> = {
      general: {},
      shipping: {},
      tax: {},
      notifications: {},
      payments: {},
    };

    dbSettings.forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    return successResponse(settingsMap);
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return successResponse({
      general: {},
      shipping: {},
      tax: {},
      notifications: {},
      payments: {},
    });
  }
}
