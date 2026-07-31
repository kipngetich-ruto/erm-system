import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { patients, appointments, medicalRecords, billing } from '../db/schema';
import { and, eq, sql, count, gte, lte, desc } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalPatients = await this.db
      .select({ count: count() })
      .from(patients)
      .then(res => Number(res[0]?.count) || 0);

    const todayAppointments = await this.db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledDate, startOfDay),
          lte(appointments.scheduledDate, now)
        )
      )
      .then(res => Number(res[0]?.count) || 0);

    const activeRecords = await this.db
      .select({ count: count() })
      .from(medicalRecords)
      .then(res => Number(res[0]?.count) || 0);

    const pendingBills = await this.db
      .select({ count: count() })
      .from(billing)
      .where(eq(billing.status, 'pending'))
      .then(res => Number(res[0]?.count) || 0);

    return {
      totalPatients,
      todayAppointments,
      activeRecords,
      pendingBills,
    };
  }

  async getRecentActivities(limit = 5) {
    try {
      const recent = await this.db
        .select()
        .from(schema.auditLogs)
        .orderBy(desc(schema.auditLogs.timestamp))
        .limit(limit);

      return recent.map(log => ({
        action: log.action,
        time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'recently',
        type: log.action.includes('update') ? 'update' :
              log.action.includes('lab') ? 'lab' :
              log.action.includes('dispense') ? 'pharma' :
              log.action.includes('register') ? 'register' : 'other',
      }));
    } catch (error) {
      // If auditLogs table doesn't exist yet, return empty array
      return [];
    }
  }
}