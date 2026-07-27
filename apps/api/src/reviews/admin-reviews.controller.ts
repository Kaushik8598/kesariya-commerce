import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.reviewsService.findAdminReviews(page, limit, search, status);
  }

  @Patch(':id/approve')
  toggleApprove(@Param('id') id: string) {
    return this.reviewsService.toggleApproval(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.removeAdminReview(id);
  }
}
