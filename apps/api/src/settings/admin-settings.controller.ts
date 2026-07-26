import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  getAll() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Patch(':key')
  async updateGroup(@Param('key') key: string, @Body() value: any, @Req() req: any) {
    const updated = await this.settingsService.updateSettingGroup(key, value);

    const userName = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Admin User' : 'Admin User';
    const userRole = req.user?.role?.slug || 'admin';
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '192.168.1.1';

    await this.auditLogsService.logAction(
      userName,
      userRole,
      'UPDATE_SETTINGS',
      `Updated store setting group '${key.toUpperCase()}'`,
      String(clientIp),
    );

    return updated;
  }
}
