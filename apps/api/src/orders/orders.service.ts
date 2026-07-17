import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserOrders(userId: string, filters?: { status?: string; paymentStatus?: string; search?: string }) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    
    if (filters?.search) {
      where.orderNumber = { contains: filters.search };
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
            },
            variant: {
              select: { size: true, color: true },
            },
            measurementProfile: { include: { values: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderDetails(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { userId, orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
            },
            variant: {
              select: { size: true, color: true },
            },
            measurementProfile: { include: { values: true } },
          },
        },
        shippingAddress: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
