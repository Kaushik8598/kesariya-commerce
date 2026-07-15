import { Controller, Get, Post, Param, UseGuards, Delete } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @ApiOperation({ summary: 'Get user wishlist' })
  @Get()
  getWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistsService.getWishlist(userId);
  }

  @ApiOperation({ summary: 'Check if a product is in wishlist' })
  @Get(':productId/check')
  checkIsWishlisted(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.checkIsWishlisted(userId, productId);
  }

  @ApiOperation({ summary: 'Toggle product in wishlist' })
  @Post(':productId/toggle')
  toggleWishlistItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.toggleWishlistItem(userId, productId);
  }
}
