import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';
import { UpdateCmsPageDto } from './dto/update-cms-page.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminAll(page = 1, limit = 10, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total, publishedCount] = await Promise.all([
      this.prisma.cmsPage.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cmsPage.count({ where }),
      this.prisma.cmsPage.count({ where: { isPublished: true } }),
    ]);

    return {
      data: pages,
      stats: {
        publishedCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    if (!page || !page.isPublished) {
      throw new NotFoundException('CMS page not found');
    }
    return page;
  }

  async create(dto: CreateCmsPageDto) {
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.prisma.cmsPage.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`CMS page with slug "${slug}" already exists`);
    }

    return this.prisma.cmsPage.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      },
    });
  }

  async update(id: string, dto: UpdateCmsPageDto) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('CMS page not found');
    }

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.prisma.cmsPage.findUnique({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException(`CMS page with slug "${dto.slug}" already exists`);
      }
    }

    return this.prisma.cmsPage.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.content && { content: dto.content }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async remove(id: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('CMS page not found');
    }
    return this.prisma.cmsPage.delete({ where: { id } });
  }
}
