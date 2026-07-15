import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            _count: { select: { reviews: { where: { isApproved: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => item.product);
  }

  async toggleWishlistItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      return { success: true, message: 'Product removed from wishlist', isWishlisted: false };
    } else {
      await this.prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      return { success: true, message: 'Product added to wishlist', isWishlisted: true };
    }
  }

  async checkIsWishlisted(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return !!item;
  }
}
