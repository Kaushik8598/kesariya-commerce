import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

function formatOrderResponse(order: any) {
  let formattedAddress: any = null;
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    formattedAddress = {
      id: addr.id, fullName: addr.fullName, phone: addr.mobile || "", mobile: addr.mobile || "",
      addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "", postalCode: addr.postalCode,
      city: addr.city?.name || "", state: addr.state?.name || "", country: addr.country?.name || "",
      label: addr.label || "", type: addr.type || "HOME",
    };
  }
  return { ...order, shippingAddress: formattedAddress };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (paymentStatus && paymentStatus !== "ALL") where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total, totalRevenueAgg] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, slug: true } },
              variant: { select: { id: true, sku: true, size: true, color: true } },
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

    return successResponse({
      data: orders.map(formatOrderResponse),
      stats: { totalRevenue: Number(totalRevenueAgg._sum.total || 0) },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return serverErrorResponse();
  }
}
