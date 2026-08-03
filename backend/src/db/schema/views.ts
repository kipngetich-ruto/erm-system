import { pgView } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  uuid,
  varchar,
  text,
  date,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

// ==========================================
// VIEW 1: Doctor View – patient info + medical records
// ==========================================
export const doctorPatientView = pgView('doctor_patient_view', {
  patient_id: uuid('patient_id'),
  full_name: varchar('full_name', { length: 100 }),
  dob: date('dob'),
  gender: varchar('gender', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  record_id: uuid('record_id'),
  encrypted_diagnosis: text('encrypted_diagnosis'),
  encrypted_treatment: text('encrypted_treatment'),
  encrypted_notes: text('encrypted_notes'),
  visit_date: timestamp('visit_date'),
  is_follow_up: boolean('is_follow_up'),
  doctor_email: varchar('doctor_email', { length: 255 }),
}).as(sql`
  SELECT
    p.id AS patient_id,
    p.full_name AS full_name,
    p.dob AS dob,
    p.gender AS gender,
    p.phone AS phone,
    p.email AS email,
    p.address AS address,
    mr.id AS record_id,
    mr.encrypted_diagnosis AS encrypted_diagnosis,
    mr.encrypted_treatment AS encrypted_treatment,
    mr.encrypted_notes AS encrypted_notes,
    mr.visit_date AS visit_date,
    mr.is_follow_up AS is_follow_up,
    u.email AS doctor_email
  FROM patients p
  LEFT JOIN medical_records mr ON p.id = mr.patient_id
  LEFT JOIN users u ON mr.doctor_id = u.id AND u.role = 'doctor'
`);

// ==========================================
// VIEW 2: Nurse View – patient demographics + upcoming appointments
// ==========================================
export const nursePatientView = pgView('nurse_patient_view', {
  patient_id: uuid('patient_id'),
  full_name: varchar('full_name', { length: 100 }),
  dob: date('dob'),
  gender: varchar('gender', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  next_appointment: timestamp('next_appointment'),
  appointment_reason: text('appointment_reason'),
}).as(sql`
  SELECT
    p.id AS patient_id,
    p.full_name AS full_name,
    p.dob AS dob,
    p.gender AS gender,
    p.phone AS phone,
    p.email AS email,
    p.address AS address,
    a.scheduled_date AS next_appointment,
    a.reason AS appointment_reason
  FROM patients p
  LEFT JOIN appointments a
    ON p.id = a.patient_id
    AND a.status = 'scheduled'
    AND a.scheduled_date >= CURRENT_DATE
  ORDER BY a.scheduled_date
`);

// ==========================================
// VIEW 3: Receptionist View – patient info + registration details
// ==========================================
export const receptionistPatientView = pgView('receptionist_patient_view', {
  patient_id: uuid('patient_id'),
  full_name: varchar('full_name', { length: 100 }),
  dob: date('dob'),
  gender: varchar('gender', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  registration_date: timestamp('registration_date'),
  registered_by: varchar('registered_by', { length: 255 }),
}).as(sql`
  SELECT
    p.id AS patient_id,
    p.full_name AS full_name,
    p.dob AS dob,
    p.gender AS gender,
    p.phone AS phone,
    p.email AS email,
    p.address AS address,
    p.created_at AS registration_date,
    u.email AS registered_by
  FROM patients p
  LEFT JOIN users u ON p.registered_by = u.id
`);