import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, SQL } from 'drizzle-orm';
import * as schema from '../db/schema';
import { billing, patients, users } from '../db/schema';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';

@Injectable()
export class BillingService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async create(data: CreateBillingDto, userId: string) {
    const existing = await this.db
      .select()
      .from(billing)
      .where(eq(billing.invoiceNumber, data.invoiceNumber))
      .limit(1);
    if (existing.length) {
      throw new Error('Invoice number already exists');
    }

    const result = await this.db
      .insert(billing)
      .values({
        patientId: data.patientId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount.toString(),
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null,
        status: 'pending',
        createdBy: userId,
      })
      .returning();
    return result[0];
  }

  async findAll(filters: { patientId?: string; status?: string }) {
    const conditions: SQL<unknown>[] = [];
    if (filters.patientId) conditions.push(eq(billing.patientId, filters.patientId));
    if (filters.status) conditions.push(eq(billing.status, filters.status as any));

    let query: any = this.db
      .select({
        id: billing.id,
        patientId: billing.patientId,
        patientName: patients.fullName,
        invoiceNumber: billing.invoiceNumber,
        amount: billing.amount,
        description: billing.description,
        status: billing.status,
        dueDate: billing.dueDate,
        paidAt: billing.paidAt,
        paymentMethod: billing.paymentMethod,
        createdBy: billing.createdBy,
        createdAt: billing.createdAt,
        creatorEmail: users.email,
      })
      .from(billing)
      .leftJoin(patients, eq(billing.patientId, patients.id))
      .leftJoin(users, eq(billing.createdBy, users.id));

    if (conditions.length) query = query.where(and(...conditions));
    query = query.orderBy(desc(billing.createdAt));

    return await query;
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: billing.id,
        patientId: billing.patientId,
        patientName: patients.fullName,
        invoiceNumber: billing.invoiceNumber,
        amount: billing.amount,
        description: billing.description,
        status: billing.status,
        dueDate: billing.dueDate,
        paidAt: billing.paidAt,
        paymentMethod: billing.paymentMethod,
        createdBy: billing.createdBy,
        createdAt: billing.createdAt,
        creatorEmail: users.email,
      })
      .from(billing)
      .leftJoin(patients, eq(billing.patientId, patients.id))
      .leftJoin(users, eq(billing.createdBy, users.id))
      .where(eq(billing.id, id));

    if (!result[0]) throw new NotFoundException('Invoice not found');
    return result[0];
  }

  async update(id: string, data: UpdateBillingDto, userId: string, userRole: string) {
    const existing = await this.findOne(id);
    if (userRole === 'billing' && existing.createdBy !== userId) {
      throw new ForbiddenException('You can only update invoices you created');
    }
    if (userRole === 'billing' && data.status === 'paid' && data.paidAt === undefined) {
      if (data.status === 'paid' && !existing.paidAt) {
        data.paidAt = new Date().toISOString().split('T')[0];
      }
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate).toISOString().split('T')[0];
    if (data.paidAt !== undefined) updateData.paidAt = new Date(data.paidAt).toISOString().split('T')[0];
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.invoiceNumber !== undefined) {
      throw new ForbiddenException('Cannot change invoice number');
    }
    if (data.patientId !== undefined) {
      throw new ForbiddenException('Cannot change patientId');
    }

    const result = await this.db
      .update(billing)
      .set(updateData)
      .where(eq(billing.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string, userId: string, userRole: string) {
    if (userRole !== 'admin') throw new ForbiddenException('Only admin can delete invoices');
    await this.db.delete(billing).where(eq(billing.id, id));
    return { success: true };
  }
}
