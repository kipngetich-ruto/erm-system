import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, and, desc, eq, gte, lte } from 'drizzle-orm';
import * as schema from '../db/schema';
import { appointments, patients, users } from '../db/schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async create(data: CreateAppointmentDto, userId: string) {
    const result = await this.db
      .insert(appointments)
      .values({
        patientId: data.patientId,
        doctorId: data.doctorId,
        scheduledDate: new Date(data.scheduledDate),
        duration: data.duration || '30 minutes',
        reason: data.reason,
        notes: data.notes,
        createdBy: userId,
        status: 'scheduled',
      })
      .returning();
    return result[0];
  }

  async findAll(filters: {
      patientId?: string;
      doctorId?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
  }) {
    const conditions: SQL<unknown>[] = [];

    if (filters.patientId) conditions.push(eq(appointments.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));
    if (filters.status) conditions.push(eq(appointments.status, filters.status as any));
    if (filters.fromDate) conditions.push(gte(appointments.scheduledDate, new Date(filters.fromDate)));
    if (filters.toDate) conditions.push(lte(appointments.scheduledDate, new Date(filters.toDate)));

    // ✅ Cast the initial query to 'any' to allow chaining .where() and .orderBy() dynamically
    let query: any = this.db
        .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientName: patients.fullName,
        doctorId: appointments.doctorId,
        doctorName: users.email,
        scheduledDate: appointments.scheduledDate,
        duration: appointments.duration,
        reason: appointments.reason,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        })
        .from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(users, eq(appointments.doctorId, users.id));

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }
    query = query.orderBy(desc(appointments.scheduledDate));

    return await query;
  }  

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientName: patients.fullName,
        doctorId: appointments.doctorId,
        doctorName: users.email,
        scheduledDate: appointments.scheduledDate,
        duration: appointments.duration,
        reason: appointments.reason,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .where(eq(appointments.id, id));

    if (!result[0]) throw new NotFoundException('Appointment not found');
    return result[0];
  }

  async update(id: string, data: UpdateAppointmentDto, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only update your own appointments');
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.patientId !== undefined) {
      throw new ForbiddenException('Cannot change patientId of an appointment');
    }
    if (data.doctorId !== undefined) {
      throw new ForbiddenException('Cannot change doctorId of an appointment');
    }

    updateData.updatedAt = new Date();

    const result = await this.db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only delete your own appointments');
    }
    await this.db.delete(appointments).where(eq(appointments.id, id));
    return { success: true, message: 'Appointment deleted' };
  }
}