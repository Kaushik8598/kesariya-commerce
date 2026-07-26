import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Patch(':key')
  updateGroup(@Param('key') key: string, @Body() value: any) {
    return this.settingsService.updateSettingGroup(key, value);
  }
}
