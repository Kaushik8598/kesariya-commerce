import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductSlug(slug: string, page = 1, limit = 10) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId: product.id, isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({
        where: { productId: product.id, isApproved: true },
      }),
    ]);

    // Rating breakdown
    const breakdown = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId: product.id, isApproved: true },
      _count: true,
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: breakdown.find((b) => b.rating === star)?._count || 0,
    }));

    // Average rating
    const avgResult = await this.prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
    });

    return {
      reviews,
      avgRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      totalReviews: total,
      ratingBreakdown,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(slug: string, userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existing = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    return this.prisma.review.create({
      data: {
        productId: product.id,
        userId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({ where: { id } });
    return { message: 'Review deleted successfully' };
  }

  async findAdminReviews(page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status === 'APPROVED') where.isApproved = true;
    if (status === 'PENDING') where.isApproved = false;

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, approvedCount, pendingCount, avgRatingResult, data] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.count({ where: { isApproved: true } }),
      this.prisma.review.count({ where: { isApproved: false } }),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalReviews: total,
        approvedReviews: approvedCount,
        pendingReviews: pendingCount,
        averageRating: Number(avgRatingResult._avg.rating || 0).toFixed(1),
      },
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async toggleApproval(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { isApproved: !review.isApproved },
    });
  }

  async removeAdminReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.delete({ where: { id } });
  }
}
