import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, and, desc, eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { labResults, patients, users } from '../db/schema';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class LabResultsService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private encryptionService: EncryptionService,
  ) {}

  async create(data: CreateLabResultDto, doctorId: string) {
    const result = await this.db
      .insert(labResults)
      .values({
        patientId: data.patientId,
        doctorId,
        testType: data.testType,
        notes: data.notes,
        status: 'pending',
        requestedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async findAll(filters: { patientId?: string; doctorId?: string; status?: string }) {
    const conditions: SQL<unknown>[] = [];
    if (filters.patientId) conditions.push(eq(labResults.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(labResults.doctorId, filters.doctorId));
    if (filters.status) conditions.push(eq(labResults.status, filters.status as any));

    let query: any = this.db
      .select({
        id: labResults.id,
        patientId: labResults.patientId,
        patientName: patients.fullName,
        doctorId: labResults.doctorId,
        doctorName: users.email,
        technicianId: labResults.technicianId,
        testType: labResults.testType,
        encryptedResult: labResults.encryptedResult,
        status: labResults.status,
        notes: labResults.notes,
        requestedAt: labResults.requestedAt,
        completedAt: labResults.completedAt,
        createdAt: labResults.createdAt,
      })
      .from(labResults)
      .leftJoin(patients, eq(labResults.patientId, patients.id))
      .leftJoin(users, eq(labResults.doctorId, users.id));

    if (conditions.length) query = query.where(and(...conditions));
    query = query.orderBy(desc(labResults.requestedAt));

    const results = await query;
    return results.map((r: any) => ({
      ...r,
      result: r.encryptedResult ? this.encryptionService.decrypt(r.encryptedResult) : null,
    }));
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: labResults.id,
        patientId: labResults.patientId,
        patientName: patients.fullName,
        doctorId: labResults.doctorId,
        doctorName: users.email,
        technicianId: labResults.technicianId,
        testType: labResults.testType,
        encryptedResult: labResults.encryptedResult,
        status: labResults.status,
        notes: labResults.notes,
        requestedAt: labResults.requestedAt,
        completedAt: labResults.completedAt,
        createdAt: labResults.createdAt,
      })
      .from(labResults)
      .leftJoin(patients, eq(labResults.patientId, patients.id))
      .leftJoin(users, eq(labResults.doctorId, users.id))
      .where(eq(labResults.id, id));

    if (!result[0]) throw new NotFoundException('Lab result not found');
    const r = result[0];
    return {
      ...r,
      result: r.encryptedResult ? this.encryptionService.decrypt(r.encryptedResult) : null,
    };
  }

  async update(id: string, data: UpdateLabResultDto, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }
    if (userRole === 'lab_tech') {
      const allowedKeys = ['status', 'result'];
      const requestedKeys = Object.keys(data);
      if (!requestedKeys.every(k => allowedKeys.includes(k))) {
        throw new ForbiddenException('Technicians can only update status and result');
      }
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.result !== undefined) {
      updateData.encryptedResult = this.encryptionService.encrypt(data.result);
      updateData.completedAt = new Date();
      if (!data.status) updateData.status = 'completed';
    }
    if (data.testType !== undefined) updateData.testType = data.testType;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.patientId !== undefined) {
      throw new ForbiddenException('Cannot change patientId');
    }
    if (data.doctorId !== undefined) {
      throw new ForbiddenException('Cannot change doctorId');
    }

    const result = await this.db
      .update(labResults)
      .set(updateData)
      .where(eq(labResults.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'admin') throw new ForbiddenException('Only admin can delete lab results');
    await this.db.delete(labResults).where(eq(labResults.id, id));
    return { success: true };
  }
}