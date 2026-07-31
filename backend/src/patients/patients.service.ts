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

  async create(data: CreatePatientDto, userId: string) {
    const result = await this.db
      .insert(patients)
      .values({
        ...data,
        registeredBy: userId,
      })
      .returning();
    return result[0];
  }

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

  async findOne(id: string) {
    const result = await this.db.select().from(patients).where(eq(patients.id, id));
    if (!result[0]) throw new NotFoundException('Patient not found');
    return result[0];
  }

  async update(id: string, data: UpdatePatientDto, userId: string) {
    // Check if patient exists
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

  async remove(id: string, userId: string) {
    await this.findOne(id);
    await this.db.delete(patients).where(eq(patients.id, id));
    return { success: true, message: 'Patient deleted' };
  }

  async count() {
    const result = await this.db.select({ count: count() }).from(patients);
    return Number(result[0]?.count) || 0;
  }
}