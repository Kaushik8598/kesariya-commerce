import { Controller, Get } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('public/coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findActivePublic() {
    return this.couponsService.findActivePublicCoupons();
  }
}
