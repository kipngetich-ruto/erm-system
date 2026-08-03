import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { patients } from '../db/schema';
import { eq, ilike, or, count } from 'drizzle-orm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new patient.
   * Idempotent: if a patient with the same email already exists, returns that patient.
   */
  async create(data: CreatePatientDto, userId: string) {
    // If email is provided, check for existing patient
    if (data.email) {
      const existing = await this.db
        .select()
        .from(patients)
        .where(eq(patients.email, data.email))
        .limit(1);
      if (existing.length > 0) {
        // Return existing patient (idempotent response)
        return existing[0];
      }
    }

    // No existing patient or no email provided – create new
    const result = await this.db
      .insert(patients)
      .values({
        ...data,
        registeredBy: userId,
      })
      .returning();
    return result[0];
  }

  /**
   * Find all patients, optionally filtered by search term.
   */
  async findAll(search?: string) {
    const query = this.db.select().from(patients);
    if (search) {
      const term = `%${search}%`;
      query.where(
        or(
          ilike(patients.fullName, term),
          ilike(patients.email, term),
          ilike(patients.phone, term)
        )
      );
    }
    return await query;
  }

  /**
   * Find a single patient by ID.
   * Throws NotFoundException if not found.
   */
  async findOne(id: string) {
    const result = await this.db.select().from(patients).where(eq(patients.id, id));
    if (!result[0]) throw new NotFoundException('Patient not found');
    return result[0];
  }

  /**
   * Update a patient.
   * Idempotent: multiple identical updates yield the same final state.
   * Returns 404 if patient does not exist.
   */
  async update(id: string, data: UpdatePatientDto, userId: string) {
    // Ensure patient exists (throws 404 if not)
    await this.findOne(id);
    const result = await this.db
      .update(patients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id))
      .returning();
    return result[0];
  }

  /**
   * Delete a patient.
   * Idempotent: always returns success, even if the patient does not exist.
   */
  async remove(id: string, userId: string) {
    // Delete if exists; if not, no operation is performed.
    await this.db.delete(patients).where(eq(patients.id, id));
    return { success: true };
  }

  /**
   * Count total patients.
   */
  async count() {
    const result = await this.db.select({ count: count() }).from(patients);
    return Number(result[0]?.count) || 0;
  }
}
