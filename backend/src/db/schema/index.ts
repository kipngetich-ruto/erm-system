import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  decimal,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ============ ENUMS ============
export const roleEnum = pgEnum('role', [
  'admin',
  'doctor',
  'nurse',
  'pharmacist',
  'lab_tech',
  'receptionist',
  'billing',
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
]);

export const prescriptionStatusEnum = pgEnum('prescription_status', [
  'active',
  'dispensed',
  'cancelled',
  'expired',
]);

export const labStatusEnum = pgEnum('lab_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

export const billingStatusEnum = pgEnum('billing_status', [
  'pending',
  'paid',
  'overdue',
  'cancelled',
]);

// ============ USERS ============
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  twoFactorSecret: text('two_factor_secret'),
  isTwoFactorEnabled: boolean('is_two_factor_enabled').default(false),
  role: roleEnum('role').notNull().default('receptionist'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ PATIENTS ============
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  dob: date('dob').notNull(),
  gender: varchar('gender', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  emergencyContact: varchar('emergency_contact', { length: 100 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  registeredBy: uuid('registered_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ MEDICAL RECORDS ============
export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id),
  encryptedDiagnosis: text('encrypted_diagnosis').notNull(),
  encryptedTreatment: text('encrypted_treatment').notNull(),
  encryptedNotes: text('encrypted_notes'),
  visitDate: timestamp('visit_date').defaultNow(),
  isFollowUp: boolean('is_follow_up').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ APPOINTMENTS ============
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  duration: varchar('duration', { length: 20 }).default('30 minutes'),
  reason: text('reason'),
  status: appointmentStatusEnum('status').default('scheduled'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ PRESCRIPTIONS ============
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id),
  pharmacistId: uuid('pharmacist_id').references(() => users.id),
  encryptedMedication: text('encrypted_medication').notNull(),
  dosage: varchar('dosage', { length: 50 }),
  instructions: text('instructions'),
  status: prescriptionStatusEnum('status').default('active'),
  issuedAt: timestamp('issued_at').defaultNow(),
  dispensedAt: timestamp('dispensed_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ LAB RESULTS ============
export const labResults = pgTable('lab_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => users.id),
  technicianId: uuid('technician_id').references(() => users.id),
  testType: varchar('test_type', { length: 100 }).notNull(),
  encryptedResult: text('encrypted_result'),
  status: labStatusEnum('status').default('pending'),
  notes: text('notes'),
  requestedAt: timestamp('requested_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ BILLING ============
export const billing = pgTable('billing', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  status: billingStatusEnum('status').default('pending'),
  dueDate: date('due_date'),
  paidAt: timestamp('paid_at'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============ REFRESH TOKENS ============
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============ AUDIT LOGS ============
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 255 }),
  details: text('details'),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  status: varchar('status', { length: 20 }).default('success'),
  timestamp: timestamp('timestamp').defaultNow(),
});
