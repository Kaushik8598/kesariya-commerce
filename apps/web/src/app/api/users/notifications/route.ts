import { NextRequest } from "next/server";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function PATCH(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  return successResponse({ message: "Notification preferences updated successfully" });
}
