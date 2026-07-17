import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeasurementType } from '../../generated/prisma';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  getTypes() {
    return Object.values(MeasurementType).map(value => ({
      value,
      label: value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
    }));
  }

  async findAll(userId: string) {
    return this.prisma.measurementProfile.findMany({
      where: { userId },
      include: {
        values: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(userId: string, id: string) {
    const profile = await this.prisma.measurementProfile.findFirst({
      where: { id, userId },
      include: { values: true },
    });

    if (!profile) {
      throw new NotFoundException('Measurement profile not found');
    }
    return profile;
  }

  async create(userId: string, data: any) {
    const { name, isDefault, values } = data;

    // If this is the first one or set to default, unset others
    if (isDefault) {
      await this.prisma.measurementProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first profile
    const count = await this.prisma.measurementProfile.count({ where: { userId } });
    const shouldBeDefault = count === 0 ? true : isDefault;

    return this.prisma.measurementProfile.create({
      data: {
        userId,
        name,
        isDefault: shouldBeDefault,
        values: {
          create: values?.map(v => ({
            type: v.type,
            value: v.value,
            customName: v.customName,
          })) || [],
        },
      },
      include: { values: true },
    });
  }

  async update(userId: string, id: string, data: any) {
    const { name, isDefault, values } = data;

    // Check ownership
    await this.findOne(userId, id);

    if (isDefault) {
      await this.prisma.measurementProfile.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Upsert values - the easiest way is to delete old ones and insert new ones
    return this.prisma.$transaction(async (tx) => {
      if (values) {
        await tx.measurementValue.deleteMany({
          where: { profileId: id },
        });
      }

      return tx.measurementProfile.update({
        where: { id },
        data: {
          name,
          ...(isDefault !== undefined && { isDefault }),
          ...(values && {
            values: {
              create: values.map(v => ({
                type: v.type,
                value: v.value,
                customName: v.customName,
              })),
            },
          }),
        },
        include: { values: true },
      });
    });
  }

  async setDefault(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.measurementProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.measurementProfile.update({
        where: { id },
        data: { isDefault: true },
        include: { values: true },
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.measurementProfile.delete({
      where: { id },
    });
    return { success: true };
  }
}

