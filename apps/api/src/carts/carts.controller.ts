import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({ summary: 'Get user cart' })
  @Get()
  getCart(@CurrentUser('id') userId: string) {
    return this.cartsService.getCart(userId);
  }

  @ApiOperation({ summary: 'Add item to cart' })
  @Post('items')
  addItem(
    @CurrentUser('id') userId: string,
    @Body() body: { productId: string; variantId?: string; quantity?: number; measurementProfileId?: string },
  ) {
    return this.cartsService.addItem(userId, body.productId, body.variantId, body.quantity || 1, body.measurementProfileId);
  }

  @ApiOperation({ summary: 'Update item quantity' })
  @Patch('items/:id')
  updateItemQuantity(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartsService.updateItemQuantity(userId, itemId, quantity);
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @Delete('items/:id')
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
  ) {
    return this.cartsService.removeItem(userId, itemId);
  }

  @ApiOperation({ summary: 'Apply a coupon' })
  @Post('coupon')
  applyCoupon(
    @CurrentUser('id') userId: string,
    @Body('code') code: string,
  ) {
    return this.cartsService.applyCoupon(userId, code);
  }

  @ApiOperation({ summary: 'Remove applied coupon' })
  @Delete('coupon')
  removeCoupon(@CurrentUser('id') userId: string) {
    return this.cartsService.removeCoupon(userId);
  }
}
