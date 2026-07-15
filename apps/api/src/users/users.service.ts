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
}
