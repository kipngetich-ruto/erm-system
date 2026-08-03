import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { auditLogs } from '../db/schema';
import { count, desc } from 'drizzle-orm';

@Injectable()
export class AuditService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async log(data: {
    userId?: string;
    action: string;
    resource: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    status: string;
  }) {
    const detailsStr = data.details ? JSON.stringify(data.details) : null;
    await this.db.insert(auditLogs).values({
      userId: data.userId || null,
      action: data.action,
      resource: data.resource,
      details: detailsStr,
      ip: data.ip,
      userAgent: data.userAgent,
      status: data.status,
      timestamp: new Date(),
    });
  }

  async findAll(take: number = 50, skip: number = 0) {
    const logs = await this.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(take)
      .offset(skip);

    const totalResult = await this.db
      .select({ count: count() })
      .from(auditLogs);

    return {
      data: logs,
      total: Number(totalResult[0]?.count) || 0,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }
}