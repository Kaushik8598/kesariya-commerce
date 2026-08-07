import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

const INITIAL_TESTIMONIALS = [
  { name: "Vikramaditya Sharma", role: "Verified Buyer", location: "Mumbai, India", rating: 5, product: "Pure Linen Mandarin Shirt", comment: "The fabric weight and breathability of Kesariya's linen shirts are phenomenal.", sortOrder: 1, isActive: true },
  { name: "Rohan Singhania", role: "Verified Buyer", location: "Ahmedabad, India", rating: 5, product: "Jaipur Hand-Block Print Shirt", comment: "Outstanding block print detail and custom sleeve fit.", sortOrder: 2, isActive: true },
  { name: "Aditya Mehta", role: "Verified Buyer", location: "Bengaluru, India", rating: 5, product: "Organic Cotton Spread Collar Shirt", comment: "Subtle elegance with perfect fitting across shoulders and chest.", sortOrder: 3, isActive: true },
];

export async function GET(_request: NextRequest) {
  try {
    const count = await prisma.testimonial.count();
    if (count === 0) {
      await prisma.testimonial.createMany({ data: INITIAL_TESTIMONIALS });
    }
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return successResponse(testimonials);
  } catch (error) {
    console.error("Testimonials error:", error);
    return successResponse(INITIAL_TESTIMONIALS.map((item, i) => ({ id: `seeded-${i}`, ...item, createdAt: new Date(), updatedAt: new Date() })));
  }
}
