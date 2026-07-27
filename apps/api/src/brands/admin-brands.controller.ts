import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.brandsService.findAdminAll(page, limit, search, status);
  }

  @Post()
  create(@Body() body: any) {
    return this.brandsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.brandsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
