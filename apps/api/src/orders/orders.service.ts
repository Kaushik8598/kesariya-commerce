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

    const orders = await this.prisma.order.findMany({
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
        shippingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            state: { select: { id: true, name: true } },
            country: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.formatOrderResponse(order));
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
        shippingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            state: { select: { id: true, name: true } },
            country: { select: { id: true, name: true } },
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async findAdminAll(page = 1, limit = 10, search?: string, status?: string, paymentStatus?: string) {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total, totalRevenueAgg] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, slug: true } },
              variant: { select: { id: true, sku: true, size: true, color: true } },
              measurementProfile: { include: { values: true } },
            },
          },
          shippingAddress: {
            include: {
              city: { select: { id: true, name: true } },
              state: { select: { id: true, name: true } },
              country: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        _sum: { total: true },
      }),
    ]);

    return {
      data: orders.map((o) => this.formatOrderResponse(o)),
      stats: {
        totalRevenue: Number(totalRevenueAgg._sum.total || 0),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateOrderStatus(id: string, dto: { status?: string; paymentStatus?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status as any }),
        ...(dto.paymentStatus && { paymentStatus: dto.paymentStatus as any }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async removeAdminOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.order.delete({ where: { id } });
  }

  // Format order response to clean up shipping address & eliminate unneeded raw IDs
  private formatOrderResponse(order: any) {
    let formattedAddress: any = null;
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      formattedAddress = {
        id: addr.id,
        fullName: addr.fullName,
        phone: addr.mobile || addr.phone || '',
        mobile: addr.mobile || addr.phone || '',
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        landmark: addr.landmark || '',
        postalCode: addr.postalCode,
        city: addr.city?.name || (typeof addr.city === 'string' ? addr.city : ''),
        state: addr.state?.name || (typeof addr.state === 'string' ? addr.state : ''),
        country: addr.country?.name || (typeof addr.country === 'string' ? addr.country : ''),
        label: addr.label || '',
        type: addr.type || 'HOME',
      };
    }

    return {
      ...order,
      shippingAddress: formattedAddress,
    };
  }
}
