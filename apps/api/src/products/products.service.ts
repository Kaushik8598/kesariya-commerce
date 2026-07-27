import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto, ProductSortOption } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = ProductSortOption.NEWEST,
      q,
      tags,
    } = query;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (category) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (brand) {
      const brandRecord = await this.prisma.brand.findUnique({
        where: { slug: brand },
      });
      if (brandRecord) {
        where.brandId = brandRecord.id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: q.toLowerCase().split(' ') } },
      ];
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    const orderBy = this.buildSortOrder(sort);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: { where: { isApproved: true } } } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const productIds = products.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);

    let productsWithRating = products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));

    if (rating) {
      productsWithRating = productsWithRating.filter(
        (p) => p.avgRating >= rating,
      );
    }

    const filters = await this.getAvailableFilters(where);

    return {
      products: productsWithRating,
      filters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    const productIds = products.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);
    return products.map((p) => ({ ...p, avgRating: ratings[p.id] || 0 }));
  }

  async findNewArrivals(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', isNewArrival: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    const productIds = products.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);
    return products.map((p) => ({ ...p, avgRating: ratings[p.id] || 0 }));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }

    const avgResult = await this.prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });

    const breakdown = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId: product.id, isApproved: true },
      _count: true,
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: breakdown.find((b) => b.rating === star)?._count || 0,
    }));

    return {
      ...product,
      avgRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      totalReviews: avgResult._count,
      ratingBreakdown,
    };
  }

  async findRelated(slug: string, limit = 6) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const productIds = relatedProducts.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);

    return relatedProducts.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));
  }

  private buildSortOrder(sort: ProductSortOption) {
    switch (sort) {
      case ProductSortOption.PRICE_LOW:
        return { basePrice: 'asc' as const };
      case ProductSortOption.PRICE_HIGH:
        return { basePrice: 'desc' as const };
      case ProductSortOption.NAME_ASC:
        return { name: 'asc' as const };
      case ProductSortOption.NAME_DESC:
        return { name: 'desc' as const };
      case ProductSortOption.OLDEST:
        return { createdAt: 'asc' as const };
      case ProductSortOption.NEWEST:
      default:
        return { createdAt: 'desc' as const };
    }
  }

  private async getAverageRatings(
    productIds: string[],
  ): Promise<Record<string, number>> {
    if (productIds.length === 0) return {};

    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        isApproved: true,
      },
      _avg: { rating: true },
    });

    return ratings.reduce(
      (acc, r) => {
        acc[r.productId] = Number((r._avg.rating || 0).toFixed(1));
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private async getAvailableFilters(where: Prisma.ProductWhereInput) {
    const [categories, brands, priceRange] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true, products: { some: where } },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.brand.findMany({
        where: { isActive: true, products: { some: where } },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.aggregate({
        where,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return {
      categories,
      brands,
      priceRange: {
        min: Number(priceRange._min.basePrice || 0),
        max: Number(priceRange._max.basePrice || 10000),
      },
    };
  }

  async findAdminAll(page = 1, limit = 10, search?: string, status?: string) {
    const where: Prisma.ProductWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findAdminById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ slug }, { sku: dto.sku }] },
    });
    if (existing) {
      throw new ConflictException('Product with this slug or SKU already exists');
    }

    let categoryId = dto.categoryId;
    if (!categoryId) {
      const defaultCat = await this.prisma.category.findFirst();
      if (!defaultCat) {
        throw new BadRequestException('At least one category must exist before creating products');
      }
      categoryId = defaultCat.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          shortDescription: dto.shortDescription ?? null,
          description: dto.description ?? '',
          sku: dto.sku,
          basePrice: dto.basePrice,
          salePrice: dto.salePrice ?? null,
          stock: dto.stock ?? 0,
          status: dto.status || 'DRAFT',
          categoryId,
          ...(dto.brandId ? { brandId: dto.brandId } : {}),
          tags: dto.tags || [],
          isFeatured: dto.isFeatured ?? false,
          isNewArrival: dto.isNewArrival ?? false,
          isCustomizable: dto.isCustomizable ?? false,
          weight: dto.weight ?? null,
          material: dto.material ?? null,
          careInstructions: dto.careInstructions ?? null,
          videoUrl: dto.videoUrl ?? null,
          metaTitle: dto.metaTitle ?? null,
          metaDescription: dto.metaDescription ?? null,
          contentBlocks: dto.contentBlocks as any ?? null,
        },
      });

      // Upsert images
      if (dto.images && dto.images.length > 0) {
        await tx.productImage.createMany({
          data: dto.images.map((img, idx) => ({
            productId: product.id,
            url: img.url,
            publicId: img.publicId ?? null,
            alt: img.alt ?? null,
            color: img.color ?? null,
            isPrimary: img.isPrimary ?? idx === 0,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }

      // Upsert variants
      if (dto.variants && dto.variants.length > 0) {
        await tx.productVariant.createMany({
          data: dto.variants.map((v, idx) => ({
            productId: product.id,
            size: v.size ?? null,
            color: v.color ?? null,
            colorCode: v.colorCode ?? null,
            material: v.material ?? null,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            sortOrder: idx,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      });
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existingSlug = await this.prisma.product.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existingSlug) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: { sku: dto.sku, id: { not: id } },
      });
      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    return this.prisma.$transaction(async (tx) => {
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

      // Replace images if provided
      if (dto.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((img, idx) => ({
              productId: id,
              url: img.url,
              publicId: img.publicId ?? null,
              alt: img.alt ?? null,
              color: img.color ?? null,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx,
            })),
          });
        }
      }

      // Replace/Update variants if provided
      if (dto.variants !== undefined) {
        const existingVariants = await tx.productVariant.findMany({ where: { productId: id } });
        const incomingIds = dto.variants.map((v) => (v as any).id).filter(Boolean);
        const incomingSkus = dto.variants.map((v) => v.sku).filter(Boolean);

        // Delete only variants that are neither in incoming IDs nor incoming SKUs
        const toDelete = existingVariants.filter(
          (ev) => !incomingIds.includes(ev.id) && !incomingSkus.includes(ev.sku)
        );

        for (const ev of toDelete) {
          try {
            await tx.productVariant.delete({ where: { id: ev.id } });
          } catch {
            await tx.productVariant.update({ where: { id: ev.id }, data: { stock: 0 } });
          }
        }

        for (const [idx, variant] of dto.variants.entries()) {
          const vId = (variant as any).id;
          const existing = existingVariants.find(
            (ev) => (vId && ev.id === vId) || (variant.sku && ev.sku === variant.sku)
          );

          if (existing) {
            await tx.productVariant.update({
              where: { id: existing.id },
              data: {
                sku: variant.sku || existing.sku,
                size: variant.size ?? null,
                color: variant.color ?? null,
                colorCode: variant.colorCode ?? null,
                material: variant.material ?? null,
                price: Number(variant.price),
                stock: Number(variant.stock),
                sortOrder: idx,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                sku: variant.sku,
                size: variant.size ?? null,
                color: variant.color ?? null,
                colorCode: variant.colorCode ?? null,
                material: variant.material ?? null,
                price: Number(variant.price),
                stock: Number(variant.stock),
                sortOrder: idx,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      });
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.prisma.product.delete({ where: { id } });
  }

  async findAdminInventory(page = 1, limit = 10, search?: string, stockFilter?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stockFilter === 'OUT') {
      where.stock = 0;
    } else if (stockFilter === 'LOW') {
      where.stock = { gt: 0, lte: 10 };
    } else if (stockFilter === 'IN_STOCK') {
      where.stock = { gt: 10 };
    }

    const [products, total, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: { select: { id: true, sku: true, size: true, color: true, stock: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
      this.prisma.product.count({ where: { stock: { gt: 10 } } }),
      this.prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
      this.prisma.product.count({ where: { stock: 0 } }),
    ]);

    return {
      data: products,
      stats: {
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateStock(id: string, stock: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: Math.max(0, stock) },
      include: {
        category: { select: { name: true } },
      },
    });
  }
}
