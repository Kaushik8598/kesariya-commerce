import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

function formatOrderResponse(order: any) {
  let formattedAddress: any = null;
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    formattedAddress = {
      id: addr.id,
      fullName: addr.fullName,
      phone: addr.mobile || addr.phone || "",
      mobile: addr.mobile || addr.phone || "",
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      postalCode: addr.postalCode,
      city: addr.city?.name || (typeof addr.city === "string" ? addr.city : ""),
      state: addr.state?.name || (typeof addr.state === "string" ? addr.state : ""),
      country: addr.country?.name || (typeof addr.country === "string" ? addr.country : ""),
      label: addr.label || "",
      type: addr.type || "HOME",
    };
  }
  return { ...order, shippingAddress: formattedAddress };
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = { userId };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) where.orderNumber = { contains: search };

    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(orders.map(formatOrderResponse));
  } catch (error) {
    console.error("Orders GET error:", error);
    return serverErrorResponse();
  }
}
