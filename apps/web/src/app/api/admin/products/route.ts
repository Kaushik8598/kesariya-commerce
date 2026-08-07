import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse({
      data: products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const dto = await request.json();
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { sku: dto.sku }] } });
    if (existing) return conflictResponse("Product with this slug or SKU already exists");

    let categoryId = dto.categoryId;
    if (!categoryId) {
      const defaultCat = await prisma.category.findFirst();
      if (!defaultCat) return serverErrorResponse("At least one category must exist");
      categoryId = defaultCat.id;
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: dto.name, slug, shortDescription: dto.shortDescription ?? null,
          description: dto.description ?? "", sku: dto.sku,
          basePrice: dto.basePrice, salePrice: dto.salePrice ?? null,
          stock: dto.stock ?? 0, status: dto.status || "DRAFT",
          categoryId, ...(dto.brandId ? { brandId: dto.brandId } : {}),
          tags: dto.tags || [], isFeatured: dto.isFeatured ?? false,
          isNewArrival: dto.isNewArrival ?? false, isCustomizable: dto.isCustomizable ?? false,
          weight: dto.weight ?? null, material: dto.material ?? null,
          careInstructions: dto.careInstructions ?? null, videoUrl: dto.videoUrl ?? null,
          metaTitle: dto.metaTitle ?? null, metaDescription: dto.metaDescription ?? null,
          contentBlocks: dto.contentBlocks as any ?? null,
        },
      });
      if (dto.images?.length > 0) {
        await tx.productImage.createMany({
          data: dto.images.map((img: any, idx: number) => ({
            productId: p.id, url: img.url, publicId: img.publicId ?? null,
            alt: img.alt ?? null, color: img.color ?? null,
            isPrimary: img.isPrimary ?? idx === 0, sortOrder: img.sortOrder ?? idx,
          })),
        });
      }
      if (dto.variants?.length > 0) {
        await tx.productVariant.createMany({
          data: dto.variants.map((v: any, idx: number) => ({
            productId: p.id, size: v.size ?? null, color: v.color ?? null,
            colorCode: v.colorCode ?? null, material: v.material ?? null,
            sku: v.sku, price: v.price, stock: v.stock, sortOrder: idx,
          })),
        });
      }
      return tx.product.findUnique({
        where: { id: p.id },
        include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: { select: { id: true, name: true } }, brand: { select: { id: true, name: true } } },
      });
    });
    return successResponse(product);
  } catch (error) {
    console.error("Admin product POST error:", error);
    return serverErrorResponse();
  }
}
