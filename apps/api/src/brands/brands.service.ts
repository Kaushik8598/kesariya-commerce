import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findAdminAll(page = 1, limit = 10, search?: string, status?: string) {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ slug }] },
    });
    if (existing) {
      throw new Error('Brand with this slug already exists');
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || '',
        logo: dto.logo || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: any) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return this.prisma.brand.delete({ where: { id } });
  }
}
