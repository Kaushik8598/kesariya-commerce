import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(['public/settings', 'settings/public'])
  async getPublicSettings() {
    const all = await this.settingsService.getAllSettings();
    return {
      general: {
        storeName: all.general?.storeName || '',
        storeLogo: all.general?.storeLogo || '',
        supportEmail: all.general?.supportEmail || '',
        supportPhone: all.general?.supportPhone || '',
        storeAddress: all.general?.storeAddress || '',
        storeDescription: all.general?.storeDescription || '',
        currency: all.general?.currency || '',
        maintenanceMode: Boolean(all.general?.maintenanceMode),
        socialLinks: all.general?.socialLinks || {
          instagram: '',
          facebook: '',
          twitter: '',
          whatsapp: '',
          youtube: '',
        },
      },
      shipping: {
        flatShippingFee: all.shipping?.flatShippingFee || 0,
        freeShippingThreshold: all.shipping?.freeShippingThreshold || 0,
        pincodeValidation: Boolean(all.shipping?.pincodeValidation),
      },
      tax: {
        apparelGstRate: all.tax?.apparelGstRate || 0,
        pricesIncludeGst: Boolean(all.tax?.pricesIncludeGst),
      },
      payments: {
        codEnabled: Boolean(all.payments?.codEnabled),
        codExtraCharge: all.payments?.codExtraCharge || 0,
        razorpayKeyId: all.payments?.razorpayKeyId || '',
      },
    };
  }
}
