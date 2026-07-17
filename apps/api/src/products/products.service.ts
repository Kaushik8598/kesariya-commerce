import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto, ProductSortOption } from './dto/product-query.dto';
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

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (category) {
      // Find category by slug and include children
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

    // Build sort order
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

    // Get average ratings
    const productIds = products.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);

    // Filter by rating if specified (post-query filter)
    let productsWithRating = products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));

    if (rating) {
      productsWithRating = productsWithRating.filter(
        (p) => p.avgRating >= rating,
      );
    }

    // Get available filters
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

    return products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));
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

    return products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get average rating and rating breakdown
    const [avgResult, breakdown] = await Promise.all([
      this.prisma.review.aggregate({
        where: { productId: product.id, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId: product.id, isApproved: true },
        _count: true,
        orderBy: { rating: 'desc' },
      }),
    ]);

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
}
