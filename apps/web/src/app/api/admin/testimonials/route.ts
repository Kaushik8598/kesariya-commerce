import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

const INITIAL_TESTIMONIALS = [
  {
    name: "Vikramaditya Sharma",
    role: "Verified Buyer",
    location: "Mumbai, India",
    rating: 5,
    product: "Pure Linen Mandarin Shirt",
    comment: "The fabric weight and breathability of Kesariya's linen shirts are phenomenal. Easily the finest men's shirt in my wardrobe.",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Rohan Singhania",
    role: "Verified Buyer",
    location: "Ahmedabad, India",
    rating: 5,
    product: "Jaipur Hand-Block Print Shirt",
    comment: "Outstanding block print detail and custom sleeve fit. The colors stay rich even after multiple washes. Exceptional luxury!",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Aditya Mehta",
    role: "Verified Buyer",
    location: "Bengaluru, India",
    rating: 5,
    product: "Organic Cotton Spread Collar Shirt",
    comment: "Subtle elegance with perfect fitting across shoulders and chest. Prompt delivery and royal packaging experience.",
    sortOrder: 3,
    isActive: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    const count = await prisma.testimonial.count();
    if (count === 0) {
      await prisma.testimonial.createMany({ data: INITIAL_TESTIMONIALS });
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        { product: { contains: search, mode: "insensitive" } },
      ];
    }

    const [testimonials, total, activeCount] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
      prisma.testimonial.count({ where: { isActive: true } }),
    ]);

    return successResponse({
      data: testimonials,
      stats: { total, activeCount },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("Admin testimonials GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const item = await prisma.testimonial.create({
      data: {
        name: dto.name,
        role: dto.role,
        location: dto.location,
        avatar: dto.avatar,
        comment: dto.comment,
        rating: dto.rating !== undefined ? dto.rating : 5,
        product: dto.product,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
    return successResponse(item);
  } catch (error) {
    console.error("Admin testimonial POST error:", error);
    return serverErrorResponse();
  }
}
