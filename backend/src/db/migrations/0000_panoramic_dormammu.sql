CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lab_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('active', 'dispensed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'billing');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration" varchar(20) DEFAULT '30 minutes',
	"reason" text,
	"status" "appointment_status" DEFAULT 'scheduled',
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(255),
	"details" text,
	"ip" varchar(45),
	"user_agent" text,
	"status" varchar(20) DEFAULT 'success',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"status" "billing_status" DEFAULT 'pending',
	"due_date" date,
	"paid_at" timestamp,
	"payment_method" varchar(50),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "billing_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"technician_id" uuid,
	"test_type" varchar(100) NOT NULL,
	"encrypted_result" text,
	"status" "lab_status" DEFAULT 'pending',
	"notes" text,
	"requested_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"encrypted_diagnosis" text NOT NULL,
	"encrypted_treatment" text NOT NULL,
	"encrypted_notes" text,
	"visit_date" timestamp DEFAULT now(),
	"is_follow_up" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"dob" date NOT NULL,
	"gender" varchar(10),
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"emergency_contact" varchar(100),
	"emergency_phone" varchar(20),
	"registered_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"pharmacist_id" uuid,
	"encrypted_medication" text NOT NULL,
	"dosage" varchar(50),
	"instructions" text,
	"status" "prescription_status" DEFAULT 'active',
	"issued_at" timestamp DEFAULT now(),
	"dispensed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"two_factor_secret" text,
	"is_two_factor_enabled" boolean DEFAULT false,
	"role" "role" DEFAULT 'receptionist' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pharmacist_id_users_id_fk" FOREIGN KEY ("pharmacist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."doctor_patient_view" AS (
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
);--> statement-breakpoint
CREATE VIEW "public"."nurse_patient_view" AS (
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
);--> statement-breakpoint
CREATE VIEW "public"."receptionist_patient_view" AS (
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
);