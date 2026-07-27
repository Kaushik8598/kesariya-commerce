import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.cmsService.findBySlug(slug);
  }
}
