import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAdminStaff(page = 1, limit = 10, search?: string, roleId?: string) {
    const where: any = {};

    if (roleId && roleId !== 'ALL') {
      where.roleId = roleId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [staff, total, rolesCount, activeCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          countryCode: true,
          mobile: true,
          avatar: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          roleId: true,
          role: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
      this.prisma.role.count(),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
    ]);

    return {
      data: staff,
      stats: {
        rolesCount,
        activeCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async createStaff(dto: CreateStaffDto) {
    // Ensure email is unique
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email is already registered');
      }
    }

    // Default admin role if not found
    let roleId = dto.roleId;
    if (!roleId) {
      const defaultRole = await this.prisma.role.findFirst();
      if (!defaultRole) {
        throw new NotFoundException('No system roles available');
      }
      roleId = defaultRole.id;
    }

    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        mobile: dto.mobile,
        countryCode: dto.countryCode || '+91',
        password: dto.password || 'StaffPass123!',
        roleId,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        isVerified: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        role: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async updateStaff(id: string, dto: UpdateStaffDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email is already registered');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email && { email: dto.email }),
        ...(dto.mobile && { mobile: dto.mobile }),
        ...(dto.countryCode && { countryCode: dto.countryCode }),
        ...(dto.roleId && { roleId: dto.roleId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        role: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async removeStaff(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Staff member not found');
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
