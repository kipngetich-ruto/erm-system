import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function seedDashboard() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL not set');
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema } as any);

  console.log('🌱 Seeding dashboard data...');

  // 1. Ensure a doctor exists
  let doctorId: string;
  const existingDoctor = await db.select().from(schema.users).where(eq(schema.users.role, 'doctor')).limit(1);
  if (existingDoctor.length === 0) {
    const passwordHash = await argon2.hash('password123');
    const newDoctor = await db.insert(schema.users).values({
      email: 'doctor@hospital.com',
      passwordHash,
      role: 'doctor',
      isTwoFactorEnabled: false,
    }).returning();
    doctorId = newDoctor[0].id;
    console.log('👨‍⚕️ Created doctor user:', 'doctor@hospital.com');
  } else {
    doctorId = existingDoctor[0].id;
  }

  // 2. Ensure a receptionist exists
  let receptionistId: string;
  const existingReceptionist = await db.select().from(schema.users).where(eq(schema.users.role, 'receptionist')).limit(1);
  if (existingReceptionist.length === 0) {
    const passwordHash = await argon2.hash('password123');
    const newReceptionist = await db.insert(schema.users).values({
      email: 'receptionist@hospital.com',
      passwordHash,
      role: 'receptionist',
      isTwoFactorEnabled: false,
    }).returning();
    receptionistId = newReceptionist[0].id;
    console.log('💁 Created receptionist user:', 'receptionist@hospital.com');
  } else {
    receptionistId = existingReceptionist[0].id;
  }

  // 3. Patients
  const patientData = [
    { fullName: 'John Doe', dob: '1985-05-15', gender: 'Male', phone: '+254712345678', email: 'john.doe@example.com' },
    { fullName: 'Sarah Smith', dob: '1990-08-22', gender: 'Female', phone: '+254723456789', email: 'sarah.smith@example.com' },
    { fullName: 'Michael Brown', dob: '1978-11-03', gender: 'Male', phone: '+254734567890', email: 'michael.brown@example.com' },
    { fullName: 'Emily Davis', dob: '1995-02-10', gender: 'Female', phone: '+254745678901', email: 'emily.davis@example.com' },
    { fullName: 'James Wilson', dob: '1982-07-19', gender: 'Male', phone: '+254756789012', email: 'james.wilson@example.com' },
  ];

  for (const p of patientData) {
    const existing = await db.select().from(schema.patients).where(eq(schema.patients.email, p.email)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.patients).values({
        ...p,
        registeredBy: receptionistId,
      });
      console.log('✅ Created patient:', p.fullName);
    }
  }

  // 4. Appointments
  const patients = await db.select().from(schema.patients);
  for (const p of patients) {
    const existing = await db.select().from(schema.appointments).where(eq(schema.appointments.patientId, p.id)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.appointments).values({
        patientId: p.id,
        doctorId: doctorId,
        scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        duration: '30 minutes',
        reason: 'Regular check-up',
        status: 'scheduled',
        createdBy: doctorId,
      });
    }
  }
  console.log('📅 Seeded appointments');

  // 5. Medical records
  for (const p of patients) {
    const existing = await db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.patientId, p.id)).limit(1);
    if (existing.length === 0) {
      // Simple mock encryption – replace with real encryption in production
      const mockEncrypt = (text: string) => Buffer.from(text).toString('base64');
      await db.insert(schema.medicalRecords).values({
        patientId: p.id,
        doctorId: doctorId,
        encryptedDiagnosis: mockEncrypt('Type 2 Diabetes'),
        encryptedTreatment: mockEncrypt('Metformin 500mg daily'),
        visitDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      });
    }
  }
  console.log('📋 Seeded medical records');

  // 6. Billing (fixed type issues)
  for (const p of patients) {
    const existing = await db.select().from(schema.billing).where(eq(schema.billing.patientId, p.id)).limit(1);
    if (existing.length === 0) {
      const statuses = ['pending', 'paid', 'overdue'] as const;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.insert(schema.billing).values({
        patientId: p.id,
        invoiceNumber: 'INV-2026-' + String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0'),
        amount: (Math.random() * 500 + 50).toFixed(2),
        description: 'Medical services',
        status: status,
        dueDate: dueDate.toISOString().split('T')[0], // ✅ 'YYYY-MM-DD' string
        createdBy: doctorId,
      });
    }
  }
  console.log('💰 Seeded billing records');

  // 7. Audit logs
  const actions = ['LOGIN', 'CREATE_RECORD', 'VIEW_PATIENT', 'UPDATE_PATIENT', 'LOGOUT'];
  const users = await db.select().from(schema.users);
  for (let i = 0; i < 5; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await db.insert(schema.auditLogs).values({
      userId: randomUser.id,
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: '/api/patients',
      details: 'Sample activity',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    });
  }
  console.log('📝 Seeded audit logs');

  console.log('✅ Dashboard seed complete!');
  await pool.end();
}

seedDashboard().catch(console.error);