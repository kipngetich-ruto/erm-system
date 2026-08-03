import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, and, desc, eq, ilike } from 'drizzle-orm';
import * as schema from '../db/schema';
import { prescriptions, patients, users } from '../db/schema';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private encryptionService: EncryptionService,
  ) {}

  async create(data: CreatePrescriptionDto, doctorId: string) {
    const encryptedMed = this.encryptionService.encrypt(data.medication);
    const result = await this.db
      .insert(prescriptions)
      .values({
        patientId: data.patientId,
        doctorId,
        encryptedMedication: encryptedMed,
        dosage: data.dosage,
        instructions: data.instructions,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: 'active',
        issuedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async findAll(filters: { patientId?: string; doctorId?: string; status?: string }) {
    const conditions: SQL<unknown>[] = [];
    if (filters.patientId) conditions.push(eq(prescriptions.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(prescriptions.doctorId, filters.doctorId));
    if (filters.status) conditions.push(eq(prescriptions.status, filters.status as any));

    let query: any = this.db
      .select({
        id: prescriptions.id,
        patientId: prescriptions.patientId,
        patientName: patients.fullName,
        doctorId: prescriptions.doctorId,
        doctorName: users.email,
        pharmacistId: prescriptions.pharmacistId,
        encryptedMedication: prescriptions.encryptedMedication,
        dosage: prescriptions.dosage,
        instructions: prescriptions.instructions,
        status: prescriptions.status,
        issuedAt: prescriptions.issuedAt,
        dispensedAt: prescriptions.dispensedAt,
        expiresAt: prescriptions.expiresAt,
        createdAt: prescriptions.createdAt,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(prescriptions.doctorId, users.id));

    if (conditions.length) query = query.where(and(...conditions));
    query = query.orderBy(desc(prescriptions.issuedAt));

    const results = await query;
    return results.map((r: any) => ({
      ...r,
      medication: this.encryptionService.decrypt(r.encryptedMedication),
    }));
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: prescriptions.id,
        patientId: prescriptions.patientId,
        patientName: patients.fullName,
        doctorId: prescriptions.doctorId,
        doctorName: users.email,
        pharmacistId: prescriptions.pharmacistId,
        encryptedMedication: prescriptions.encryptedMedication,
        dosage: prescriptions.dosage,
        instructions: prescriptions.instructions,
        status: prescriptions.status,
        issuedAt: prescriptions.issuedAt,
        dispensedAt: prescriptions.dispensedAt,
        expiresAt: prescriptions.expiresAt,
        createdAt: prescriptions.createdAt,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(prescriptions.doctorId, users.id))
      .where(eq(prescriptions.id, id));

    if (!result[0]) throw new NotFoundException('Prescription not found');
    const r = result[0];
    return {
      ...r,
      medication: this.encryptionService.decrypt(r.encryptedMedication),
    };
  }

  async update(id: string, data: UpdatePrescriptionDto, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'doctor' && existing.doctorId !== userId) {
      throw new ForbiddenException('You can only update your own prescriptions');
    }
    if (userRole === 'pharmacist' && data.status && data.status !== 'dispensed') {
      throw new ForbiddenException('Pharmacists can only set status to dispensed');
    }

    const updateData: any = {};
    if (data.medication !== undefined) updateData.encryptedMedication = this.encryptionService.encrypt(data.medication);
    if (data.dosage !== undefined) updateData.dosage = data.dosage;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.expiresAt !== undefined) updateData.expiresAt = new Date(data.expiresAt);
    if (data.status !== undefined) updateData.status = data.status;

    // Pharmacist dispensing updates pharmacistId and dispensedAt
    if (data.status === 'dispensed' && userRole === 'pharmacist') {
      updateData.pharmacistId = userId;
      updateData.dispensedAt = new Date();
    }

    const result = await this.db
      .update(prescriptions)
      .set(updateData)
      .where(eq(prescriptions.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'admin') throw new ForbiddenException('Only admin can delete prescriptions');
    await this.db.delete(prescriptions).where(eq(prescriptions.id, id));
    return { success: true };
  }
}