import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

function formatOrderResponse(order: any) {
  let formattedAddress: any = null;
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    formattedAddress = {
      id: addr.id, fullName: addr.fullName, phone: addr.mobile || addr.phone || "",
      mobile: addr.mobile || addr.phone || "", addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "", landmark: addr.landmark || "",
      postalCode: addr.postalCode,
      city: addr.city?.name || (typeof addr.city === "string" ? addr.city : ""),
      state: addr.state?.name || (typeof addr.state === "string" ? addr.state : ""),
      country: addr.country?.name || (typeof addr.country === "string" ? addr.country : ""),
      label: addr.label || "", type: addr.type || "HOME",
    };
  }
  return { ...order, shippingAddress: formattedAddress };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { orderNumber } = await params;
    const order = await prisma.order.findFirst({
      where: { userId, orderNumber },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
            variant: { select: { size: true, color: true } },
            measurementProfile: { include: { values: true } },
          },
        },
        shippingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            state: { select: { id: true, name: true } },
            country: { select: { id: true, name: true } },
          },
        },
        coupon: true,
      },
    });

    if (!order) return notFoundResponse("Order not found");

    return successResponse(formatOrderResponse(order));
  } catch (error) {
    console.error("Order detail error:", error);
    return serverErrorResponse();
  }
}
