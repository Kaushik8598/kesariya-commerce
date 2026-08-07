import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const roleId = searchParams.get("roleId") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.isActive = status === "ACTIVE";
    if (roleId && roleId !== "ALL") where.roleId = roleId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total, verifiedCount, rolesList] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, countryCode: true,
          mobile: true, avatar: true, isActive: true, isVerified: true, createdAt: true,
          roleId: true, role: { select: { id: true, name: true, slug: true } },
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isVerified: true } }),
      prisma.role.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    return successResponse({
      data: users, roles: rolesList,
      stats: { verifiedCount },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return serverErrorResponse();
  }
}
