import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings() {
    try {
      const dbSettings = await this.prisma.storeSetting.findMany();
      const settingsMap: Record<string, any> = {
        general: {},
        shipping: {},
        tax: {},
        notifications: {},
        payments: {},
      };

      dbSettings.forEach((item) => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    } catch (error) {
      this.logger.error('Error fetching store settings:', error);
      return {
        general: {},
        shipping: {},
        tax: {},
        notifications: {},
        payments: {},
      };
    }
  }

  async getSettingByKey(key: string) {
    try {
      const dbItem = await this.prisma.storeSetting.findUnique({ where: { key } });
      return dbItem ? dbItem.value : {};
    } catch (error) {
      this.logger.error(`Error fetching store setting for key ${key}:`, error);
      return {};
    }
  }

  async updateSettingGroup(key: string, value: any) {
    const updated = await this.prisma.storeSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return updated.value;
  }
}
