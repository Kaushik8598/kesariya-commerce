import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublicSettings() {
    const all = await this.settingsService.getAllSettings();
    return {
      general: all.general,
      shipping: {
        flatShippingFee: all.shipping?.flatShippingFee,
        freeShippingThreshold: all.shipping?.freeShippingThreshold,
        pincodeValidation: all.shipping?.pincodeValidation,
      },
      tax: {
        apparelGstRate: all.tax?.apparelGstRate,
        pricesIncludeGst: all.tax?.pricesIncludeGst,
      },
      payments: {
        codEnabled: all.payments?.codEnabled,
        codExtraCharge: all.payments?.codExtraCharge,
        razorpayKeyId: all.payments?.razorpayKeyId,
      },
    };
  }
}
