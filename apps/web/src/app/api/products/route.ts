import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

async function getAverageRatings(
  productIds: string[]
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
  });
  return ratings.reduce(
    (acc, r) => {
      acc[r.productId] = Number((r._avg.rating || 0).toFixed(1));
      return acc;
    },
    {} as Record<string, number>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(50, parseInt(searchParams.get("limit") || "12"))
    );
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const rating = searchParams.get("rating")
      ? parseFloat(searchParams.get("rating")!)
      : undefined;
    const sort = searchParams.get("sort") || "newest";
    const q = searchParams.get("q") || undefined;
    const tags = searchParams.get("tags") || undefined;

    const where: any = { status: "ACTIVE" };

    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (brand) {
      const brandRecord = await prisma.brand.findUnique({
        where: { slug: brand },
      });
      if (brandRecord) where.brandId = brandRecord.id;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: q.toLowerCase().split(" ") } },
      ];
    }

    if (tags) where.tags = { hasSome: tags.split(",") };

    const orderBy: any =
      sort === "price-low"
        ? { basePrice: "asc" }
        : sort === "price-high"
          ? { basePrice: "desc" }
          : sort === "name-asc"
            ? { name: "asc" }
            : sort === "name-desc"
              ? { name: "desc" }
              : sort === "oldest"
                ? { createdAt: "asc" }
                : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: { where: { isApproved: true } } } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productIds = products.map((p) => p.id);
    const ratings = await getAverageRatings(productIds);
    let productsWithRating = products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));

    if (rating) {
      productsWithRating = productsWithRating.filter(
        (p) => p.avgRating >= rating
      );
    }

    // Available filters
    const [categories, brands, priceRange] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, products: { some: where } },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.brand.findMany({
        where: { isActive: true, products: { some: where } },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.product.aggregate({
        where,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return successResponse({
      products: productsWithRating,
      filters: {
        categories,
        brands,
        priceRange: {
          min: Number(priceRange._min.basePrice || 0),
          max: Number(priceRange._max.basePrice || 10000),
        },
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return serverErrorResponse();
  }
}
