import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, any> = {
      general: {},
      shipping: {},
      tax: {},
      notifications: {},
      payments: {},
    };
    settings.forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    return successResponse(settingsMap);
  } catch (error) {
    console.error("Public settings error:", error);
    return successResponse({ general: {}, shipping: {}, tax: {}, notifications: {}, payments: {} });
  }
}
