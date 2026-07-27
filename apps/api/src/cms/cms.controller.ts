import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get(['cms/:slug', 'info/:slug', 'public/info/:slug', 'public/cms/pages/:slug', 'public/pages/:slug'])
  findBySlug(@Param('slug') slug: string) {
    return this.cmsService.findBySlug(slug);
  }

  @Get(['cms', 'info', 'public/info', 'public/cms/pages'])
  findPublished() {
    return this.cmsService.findAdminAll(1, 100);
  }
}
