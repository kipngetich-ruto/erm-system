import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in .env');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema } as any);

  // Check if user already exists
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'test@example.com'))
    .limit(1);

  if (existing.length > 0) {
    console.log('✅ Test user already exists.');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: password123`);
    await pool.end();
    return;
  }

  // Generate password hash
  const password = '12345678'; // Use a secure password in production
  const passwordHash = await argon2.hash(password);

  // Insert the test user – use camelCase property names
  await db.insert(schema.users).values({
    email: 'test@example.com',
    passwordHash: passwordHash, // property name matches schema
    role: 'admin', // enum value as string
    isTwoFactorEnabled: false,
  });

  console.log('✅ Test user created:');
  console.log(`   Email: test@example.com`);
  console.log(`   Password: ${password}`);
  console.log('   Role: admin');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});