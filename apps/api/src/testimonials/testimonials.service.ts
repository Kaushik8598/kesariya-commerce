import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

const INITIAL_TESTIMONIALS = [
  {
    name: "Vikramaditya Sharma",
    role: "Verified Buyer",
    location: "Mumbai, India",
    rating: 5,
    product: "Pure Linen Mandarin Shirt",
    comment: "The fabric weight and breathability of Kesariya's linen shirts are phenomenal. Easily the finest men's shirt in my wardrobe.",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Rohan Singhania",
    role: "Verified Buyer",
    location: "Ahmedabad, India",
    rating: 5,
    product: "Jaipur Hand-Block Print Shirt",
    comment: "Outstanding block print detail and custom sleeve fit. The colors stay rich even after multiple washes. Exceptional luxury!",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Aditya Mehta",
    role: "Verified Buyer",
    location: "Bengaluru, India",
    rating: 5,
    product: "Organic Cotton Spread Collar Shirt",
    comment: "Subtle elegance with perfect fitting across shoulders and chest. Prompt delivery and royal packaging experience.",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "Karan Johar",
    role: "Verified Buyer",
    location: "Delhi, India",
    rating: 5,
    product: "French Linen Resort Shirt",
    comment: "Loved the crisp texture and relaxed silhouette for summer resort evenings. Highly recommended for gentlemen who value quality.",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "Devendra Patel",
    role: "Verified Buyer",
    location: "Surat, India",
    rating: 5,
    product: "Bandhani Heritage Print Shirt",
    comment: "Traditional roots blended seamlessly into contemporary shirt tailoring. Kesariya has earned a customer for life!",
    sortOrder: 5,
    isActive: true,
  },
];

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActivePublic() {
    try {
      const count = await this.prisma.testimonial.count();
      if (count === 0) {
        await this.prisma.testimonial.createMany({
          data: INITIAL_TESTIMONIALS,
        });
      }

      return await this.prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      console.error('Error fetching public testimonials:', error);
      return INITIAL_TESTIMONIALS.map((item, index) => ({
        id: `seeded-${index}`,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  }

  async findAdminAll(page = 1, limit = 10, search?: string) {
    try {
      const count = await this.prisma.testimonial.count();
      if (count === 0) {
        await this.prisma.testimonial.createMany({
          data: INITIAL_TESTIMONIALS,
        });
      }

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { comment: { contains: search, mode: 'insensitive' } },
          { product: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [testimonials, total, activeCount] = await Promise.all([
        this.prisma.testimonial.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.testimonial.count({ where }),
        this.prisma.testimonial.count({ where: { isActive: true } }),
      ]);

      return {
        data: testimonials,
        stats: {
          total,
          activeCount,
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      console.error('Error fetching admin testimonials:', error);
      return {
        data: INITIAL_TESTIMONIALS.map((item, index) => ({
          id: `seeded-${index}`,
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        stats: { total: INITIAL_TESTIMONIALS.length, activeCount: INITIAL_TESTIMONIALS.length },
        pagination: { total: INITIAL_TESTIMONIALS.length, page: 1, limit: 10, totalPages: 1 },
      };
    }
  }

  async findOne(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonial not found');
    return item;
  }

  async create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: {
        name: dto.name,
        role: dto.role,
        location: dto.location,
        avatar: dto.avatar,
        comment: dto.comment,
        rating: dto.rating !== undefined ? dto.rating : 5,
        product: dto.product,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonial not found');

    return this.prisma.testimonial.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.product !== undefined && { product: dto.product }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
