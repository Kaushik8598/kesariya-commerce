import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAdminLogs(query: { page?: number; limit?: number; search?: string; action?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action && query.action !== 'ALL') {
      where.action = query.action;
    }

    if (query.search) {
      where.OR = [
        { userName: { contains: query.search, mode: 'insensitive' } },
        { details: { contains: query.search, mode: 'insensitive' } },
        { action: { contains: query.search, mode: 'insensitive' } },
        { ipAddress: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async logAction(userName: string, userRole: string, action: string, details: string, ipAddress?: string) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userName,
          userRole,
          action,
          details,
          ipAddress: ipAddress || '192.168.1.1',
        },
      });
    } catch (error) {
      this.logger.error('Failed to log audit action:', error);
    }
  }
}
