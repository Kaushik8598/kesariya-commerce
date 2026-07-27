import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      create: { email: email.toLowerCase().trim(), isActive: true },
      update: { isActive: true },
    });

    return {
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: subscriber,
    };
  }

  async findAdminSubscribers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.newsletterSubscriber.count({ where }),
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async removeSubscriber(id: string) {
    const item = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Subscriber not found');
    }
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }
}
