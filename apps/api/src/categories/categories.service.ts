import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tree = false) {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true, ...(tree ? { parentId: null } : {}) },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: { where: { status: 'ACTIVE' } } } },
          },
        },
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  async findBySlug(slug: string, page = 1, limit = 12, sort = 'newest') {
    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Build sort order
    const orderBy = this.buildSortOrder(sort);

    // Get category IDs (include children for parent categories)
    const categoryIds = [
      category.id,
      ...category.children.map((c) => c.id),
    ];

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          status: 'ACTIVE',
        },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          categoryId: { in: categoryIds },
          status: 'ACTIVE',
        },
      }),
    ]);

    // Get average ratings for products
    const productIds = products.map((p) => p.id);
    const ratings = await this.getAverageRatings(productIds);

    const productsWithRating = products.map((p) => ({
      ...p,
      avgRating: ratings[p.id] || 0,
    }));

    return {
      category,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private buildSortOrder(sort: string) {
    switch (sort) {
      case 'price-low':
        return { basePrice: 'asc' as const };
      case 'price-high':
        return { basePrice: 'desc' as const };
      case 'name-asc':
        return { name: 'asc' as const };
      case 'name-desc':
        return { name: 'desc' as const };
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'newest':
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
}
