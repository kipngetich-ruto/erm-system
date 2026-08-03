import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, and, desc, eq, ilike } from 'drizzle-orm';
import * as schema from '../db/schema';
import { medicalRecords, patients, users } from '../db/schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private encryptionService: EncryptionService,
  ) {}

  async create(data: CreateMedicalRecordDto, userId: string) {
    const encryptedDiagnosis = this.encryptionService.encrypt(data.diagnosis);
    const encryptedTreatment = this.encryptionService.encrypt(data.treatment);
    const encryptedNotes = data.notes ? this.encryptionService.encrypt(data.notes) : null;

    const result = await this.db
      .insert(medicalRecords)
      .values({
        patientId: data.patientId,
        doctorId: data.doctorId,
        encryptedDiagnosis,
        encryptedTreatment,
        encryptedNotes,
        visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
        isFollowUp: data.isFollowUp || false,
      })
      .returning();

    const record = result[0];
    return {
      ...record,
      diagnosis: this.encryptionService.decrypt(record.encryptedDiagnosis),
      treatment: this.encryptionService.decrypt(record.encryptedTreatment),
      notes: record.encryptedNotes ? this.encryptionService.decrypt(record.encryptedNotes) : null,
    };
  }

  async findAll(filters: {
    patientId?: string;
    doctorId?: string;
    search?: string;
  }) {
    const conditions: SQL<unknown>[] = [];

    if (filters.patientId) conditions.push(eq(medicalRecords.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(medicalRecords.doctorId, filters.doctorId));

    // Search by patient name (since encrypted fields can't be searched directly)
    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(ilike(patients.fullName, term));
    }

    // Build query with joins
    let query: any = this.db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        patientName: patients.fullName,
        doctorId: medicalRecords.doctorId,
        doctorName: users.email,
        encryptedDiagnosis: medicalRecords.encryptedDiagnosis,
        encryptedTreatment: medicalRecords.encryptedTreatment,
        encryptedNotes: medicalRecords.encryptedNotes,
        visitDate: medicalRecords.visitDate,
        isFollowUp: medicalRecords.isFollowUp,
        createdAt: medicalRecords.createdAt,
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(users, eq(medicalRecords.doctorId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(medicalRecords.createdAt));

    const results = await query;

    // Decrypt fields for response
    return results.map((record: any) => ({
      ...record,
      diagnosis: this.encryptionService.decrypt(record.encryptedDiagnosis),
      treatment: this.encryptionService.decrypt(record.encryptedTreatment),
      notes: record.encryptedNotes ? this.encryptionService.decrypt(record.encryptedNotes) : null,
    }));
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        patientName: patients.fullName,
        doctorId: medicalRecords.doctorId,
        doctorName: users.email,
        encryptedDiagnosis: medicalRecords.encryptedDiagnosis,
        encryptedTreatment: medicalRecords.encryptedTreatment,
        encryptedNotes: medicalRecords.encryptedNotes,
        visitDate: medicalRecords.visitDate,
        isFollowUp: medicalRecords.isFollowUp,
        createdAt: medicalRecords.createdAt,
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(users, eq(medicalRecords.doctorId, users.id))
      .where(eq(medicalRecords.id, id));

    if (!result[0]) throw new NotFoundException('Medical record not found');

    const record = result[0];
    return {
      ...record,
      diagnosis: this.encryptionService.decrypt(record.encryptedDiagnosis),
      treatment: this.encryptionService.decrypt(record.encryptedTreatment),
      notes: record.encryptedNotes ? this.encryptionService.decrypt(record.encryptedNotes) : null,
    };
  }

  async update(id: string, data: UpdateMedicalRecordDto, userId: string, userRole: string) {
    const existing = await this.findOne(id);

    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only update your own medical records');
    }

    const updateData: any = {};
    if (data.diagnosis !== undefined) updateData.encryptedDiagnosis = this.encryptionService.encrypt(data.diagnosis);
    if (data.treatment !== undefined) updateData.encryptedTreatment = this.encryptionService.encrypt(data.treatment);
    if (data.notes !== undefined) updateData.encryptedNotes = data.notes ? this.encryptionService.encrypt(data.notes) : null;
    if (data.visitDate !== undefined) updateData.visitDate = new Date(data.visitDate);
    if (data.isFollowUp !== undefined) updateData.isFollowUp = data.isFollowUp;
    if (data.patientId !== undefined) {
      throw new ForbiddenException('Cannot change patientId of a medical record');
    }
    if (data.doctorId !== undefined) {
      throw new ForbiddenException('Cannot change doctorId of a medical record');
    }

    updateData.updatedAt = new Date();

    const result = await this.db
      .update(medicalRecords)
      .set(updateData)
      .where(eq(medicalRecords.id, id))
      .returning();

    const record = result[0];
    return {
      ...record,
      diagnosis: this.encryptionService.decrypt(record.encryptedDiagnosis),
      treatment: this.encryptionService.decrypt(record.encryptedTreatment),
      notes: record.encryptedNotes ? this.encryptionService.decrypt(record.encryptedNotes) : null,
    };
  }

  async remove(id: string, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only delete your own medical records');
    }
    await this.db.delete(medicalRecords).where(eq(medicalRecords.id, id));
    return { success: true };
  }
}
