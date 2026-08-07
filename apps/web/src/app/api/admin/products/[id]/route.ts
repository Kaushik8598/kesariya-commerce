import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse, conflictResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!product) return notFoundResponse("Product not found");
    return successResponse(product);
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dto = await request.json();
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return notFoundResponse("Product not found");

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await prisma.product.findFirst({ where: { slug: dto.slug, id: { not: id } } });
      if (existing) return conflictResponse("Product with this slug already exists");
    }
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await prisma.product.findFirst({ where: { sku: dto.sku, id: { not: id } } });
      if (existing) return conflictResponse("Product with this SKU already exists");
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.sku !== undefined && { sku: dto.sku }),
          ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
          ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.brandId !== undefined && { brandId: dto.brandId }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
          ...(dto.isCustomizable !== undefined && { isCustomizable: dto.isCustomizable }),
          ...(dto.weight !== undefined && { weight: dto.weight }),
          ...(dto.material !== undefined && { material: dto.material }),
          ...(dto.careInstructions !== undefined && { careInstructions: dto.careInstructions }),
          ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
          ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
          ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
          ...(dto.contentBlocks !== undefined && { contentBlocks: dto.contentBlocks as any }),
        },
      });

      if (dto.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((img: any, idx: number) => ({
              productId: id, url: img.url, publicId: img.publicId ?? null,
              alt: img.alt ?? null, color: img.color ?? null,
              isPrimary: img.isPrimary ?? idx === 0, sortOrder: img.sortOrder ?? idx,
            })),
          });
        }
      }

      if (dto.variants !== undefined) {
        const existingVariants = await tx.productVariant.findMany({ where: { productId: id } });
        const incomingIds = dto.variants.map((v: any) => v.id).filter(Boolean);
        const incomingSkus = dto.variants.map((v: any) => v.sku).filter(Boolean);
        const toDelete = existingVariants.filter((ev) => !incomingIds.includes(ev.id) && !incomingSkus.includes(ev.sku));
        for (const ev of toDelete) {
          try { await tx.productVariant.delete({ where: { id: ev.id } }); }
          catch { await tx.productVariant.update({ where: { id: ev.id }, data: { stock: 0 } }); }
        }
        for (const [idx, variant] of dto.variants.entries()) {
          const vId = (variant as any).id;
          const existing = existingVariants.find((ev) => (vId && ev.id === vId) || (variant.sku && ev.sku === variant.sku));
          if (existing) {
            await tx.productVariant.update({
              where: { id: existing.id },
              data: { sku: variant.sku || existing.sku, size: variant.size ?? null, color: variant.color ?? null, colorCode: variant.colorCode ?? null, material: variant.material ?? null, price: Number(variant.price), stock: Number(variant.stock), sortOrder: idx },
            });
          } else {
            await tx.productVariant.create({
              data: { productId: id, sku: variant.sku, size: variant.size ?? null, color: variant.color ?? null, colorCode: variant.colorCode ?? null, material: variant.material ?? null, price: Number(variant.price), stock: Number(variant.stock), sortOrder: idx },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: { select: { id: true, name: true } }, brand: { select: { id: true, name: true } } },
      });
    });
    return successResponse(updated);
  } catch (error) {
    console.error("Admin product PATCH error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return notFoundResponse("Product not found");
    await prisma.product.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (error) {
    return serverErrorResponse();
  }
}
