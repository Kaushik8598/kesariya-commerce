import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Checkout')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiOperation({ summary: 'Process checkout and create order' })
  @Post('process')
  processCheckout(
    @CurrentUser('id') userId: string,
    @Body() body: { shippingAddressId?: string; notes?: string; paymentMethod?: 'COD' | 'ONLINE' },
  ) {
    return this.checkoutService.processCheckout(userId, body);
  }
}
