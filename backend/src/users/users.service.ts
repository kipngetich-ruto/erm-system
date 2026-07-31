import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { users } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async findAll(role?: string) {
    const query = this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        isTwoFactorEnabled: users.isTwoFactorEnabled,
      })
      .from(users);

    if (role) {
      query.where(eq(users.role, role as any));
    }

    return await query;
  }
}