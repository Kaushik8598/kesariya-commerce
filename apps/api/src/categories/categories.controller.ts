import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryQueryDto } from './dto/category-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query.tree);
  }

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('sort', new DefaultValuePipe('newest')) sort: string,
  ) {
    return this.categoriesService.findBySlug(slug, page, limit, sort);
  }
}
