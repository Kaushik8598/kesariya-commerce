import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  try {
    const dbItem = await prisma.storeSetting.findUnique({ where: { key } });
    return successResponse(dbItem ? dbItem.value : {});
  } catch (error) {
    console.error(`Admin setting GET key ${key} error:`, error);
    return serverErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const value = await request.json();

    const updated = await prisma.storeSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    return successResponse(updated.value);
  } catch (error) {
    console.error("Admin setting update error:", error);
    return serverErrorResponse();
  }
}
