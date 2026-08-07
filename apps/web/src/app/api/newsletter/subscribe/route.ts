import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return errorResponse("Please provide a valid email address");
    }
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      create: { email: email.toLowerCase().trim(), isActive: true },
      update: { isActive: true },
    });
    return successResponse({ message: "Successfully subscribed to newsletter!", data: subscriber });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return serverErrorResponse();
  }
}
