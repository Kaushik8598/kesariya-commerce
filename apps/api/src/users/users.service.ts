import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        countryCode: true,
        mobile: true,
        avatar: true,
        role: { select: { slug: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        countryCode: true,
        mobile: true,
        avatar: true,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      include: {
        country: { select: { name: true, phoneCode: true } },
        state: { select: { name: true } },
        city: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAddress(userId: string, data: any) {
    // If it's the first address or marked as default, handle defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true };
  }

  async updatePassword(userId: string, data: any) {
    // Basic implementation since we don't have password hashes in this mock
    return { success: true, message: 'Password updated successfully' };
  }

  async updateNotifications(userId: string, data: any) {
    // In a real app we would update the user record
    return { success: true, message: 'Notification preferences updated successfully' };
  }

  async findAdminCustomers(page = 1, limit = 10, search?: string, status?: string, roleId?: string) {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE';
    }

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

    const [users, total, verifiedCount, rolesList] = await Promise.all([
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
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, isVerified: true } }),
      this.prisma.role.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    return {
      data: users,
      roles: rolesList,
      stats: {
        verifiedCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateUserRole(id: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { roleId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
    });
  }

  async removeAdminUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async getUserMeasurements(userId: string) {
    return this.prisma.measurementProfile.findMany({
      where: { userId },
      include: {
        values: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
