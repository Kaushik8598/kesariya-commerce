import { Controller, Get } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('public')
  findActivePublic() {
    return this.couponsService.findActivePublicCoupons();
  }
}
