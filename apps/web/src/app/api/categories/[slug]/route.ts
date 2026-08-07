import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

async function getAverageRatings(productIds: string[]): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
  });
  return ratings.reduce((acc, r) => {
    acc[r.productId] = Number((r._avg.rating || 0).toFixed(1));
    return acc;
  }, {} as Record<string, number>);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12")));
    const sort = searchParams.get("sort") || "newest";

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    });

    if (!category) return notFoundResponse("Category not found");

    const categoryIds = [category.id, ...category.children.map((c) => c.id)];

    const orderBy: any =
      sort === "price-low" ? { basePrice: "asc" } :
      sort === "price-high" ? { basePrice: "desc" } :
      sort === "name-asc" ? { name: "asc" } :
      sort === "name-desc" ? { name: "desc" } :
      sort === "oldest" ? { createdAt: "asc" } :
      { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: { in: categoryIds }, status: "ACTIVE" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: { categoryId: { in: categoryIds }, status: "ACTIVE" } }),
    ]);

    const ratings = await getAverageRatings(products.map((p) => p.id));

    return successResponse({
      category,
      products: products.map((p) => ({ ...p, avgRating: ratings[p.id] || 0 })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Category by slug error:", error);
    return serverErrorResponse();
  }
}
