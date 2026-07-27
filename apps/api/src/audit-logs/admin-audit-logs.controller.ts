import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminAuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogsService.findAdminLogs({ page, limit, search, action });
  }
}
