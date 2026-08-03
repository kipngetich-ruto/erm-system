# 🏥 Secure Electronic Medical Records (EMR) System

**ISC 6220 – Advanced Cryptography**  
*Group Project – Secure Electronic Medical Records (EMR) Management System*

---

## 📋 Project Summary

A secure, full‑stack EMR system that protects patient information through **strong authentication**, **AES‑256‑GCM encryption**, **role‑based access control**, and **secure communication**. Built with React, NestJS, PostgreSQL, and deployed on AWS with automated CI/CD.

---

## 👥 System Users

| Role | Responsibility |
|------|----------------|
| **Administrator** | Full system control, user management, audit logs |
| **Doctor** | Manage patient diagnoses, treatments, prescriptions |
| **Nurse** | Assist with patient vitals and basic care (read‑only access to records) |
| **Pharmacist** | Handle prescriptions and medication dispensing |
| **Laboratory Technician** | Manage lab tests and upload results |
| **Receptionist** | Register patients and schedule appointments |
| **Billing Officer** | Manage invoices and payments |

---

## 🔐 Information Classification

| Classification | Data Examples | Justification |
|----------------|---------------|---------------|
| **Public** | Hospital name, address, department lists | No privacy risk if exposed |
| **Confidential** | Patient names, phone numbers, email, appointment times | Could cause minor privacy harm; requires access control |
| **Sensitive** | Diagnoses, medical history, lab results, prescriptions, billing details | High privacy risk; **encrypted at rest** with AES‑256‑GCM |

---

## 🗄️ Database Design (3NF)

The database is normalised to **Third Normal Form (3NF)** with the following key tables:

- `users` – authentication + role information
- `patients` – patient demographics
- `medical_records` – encrypted diagnosis, treatment, notes
- `appointments` – scheduled visits (status: scheduled, completed, cancelled, no_show)
- `prescriptions` – encrypted medication details
- `lab_results` – encrypted test results
- `billing` – invoices and payment status
- `audit_logs` – all user actions
- `refresh_tokens` – hashed refresh tokens

**Database Views** (for role‑specific access):
- `doctor_patient_view` – patient + medical records (for doctors)
- `nurse_patient_view` – limited patient info + upcoming appointments
- `receptionist_patient_view` – patient info + registration details

**Stored Procedures & Triggers**:
- `sp_create_medical_record` – inserts a record and logs the action
- `fn_audit_patients` – automatically logs INSERT/UPDATE/DELETE on patients table

---

## 🔑 RBAC Matrix

| Role | Patients | Medical Records | Appointments | Prescriptions | Billing | Audit Logs |
|------|----------|-----------------|--------------|---------------|---------|------------|
| **Admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Doctor** | R (own patients) | CRUD (own) | R | CR (own) | R | — |
| **Nurse** | R (limited) | R | R | — | — | — |
| **Pharmacist** | R | — | — | RU (dispense) | — | — |
| **Lab Tech** | R | — | — | — | — | — |
| **Receptionist** | CRU | — | CRU | — | — | — |
| **Billing Officer** | R | — | — | — | CRU | — |

*C = Create, R = Read, U = Update, D = Delete*

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v4, Zustand, Axios |
| **Backend** | NestJS 10, TypeScript, Drizzle ORM, PostgreSQL, Argon2, Speakeasy |
| **Database** | PostgreSQL 18 |
| **Infrastructure** | Docker, Nginx, Let's Encrypt, Terraform, AWS EC2 |
| **CI/CD** | GitHub Actions, GitHub Container Registry (GHCR) |

---

## 🏛️ Architecture

- **Frontend**: Hosted on Vercel with security headers (CSP, HSTS, X‑Frame‑Options).
- **Backend**: Runs on EC2 with Nginx as reverse proxy (terminates TLS).
- **Database**: PostgreSQL container on same EC2 (private, not exposed).
- **CI/CD**: GitHub Actions builds Docker image → pushes to GHCR → deploys to EC2.

---

## ✨ Key Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | Argon2id (stronger than SHA‑256) |
| **Authentication** | JWT access/refresh tokens with rotation |
| **2FA** | TOTP (RFC 6238) via Google Authenticator |
| **Encryption** | AES‑256‑GCM for sensitive fields (diagnosis, treatment, medication, lab results) |
| **SSL/TLS** | TLS 1.3 with Let's Encrypt, HSTS, CSP, X‑Frame‑Options |
| **Audit Logging** | All user actions logged with IP, user‑agent, timestamp |
| **RBAC** | Role‑based guards on all endpoints |

---

## 📁 Project Structure

```bash
emr-system/
│
├── backend/                              # NestJS Backend API
│   ├── src/
│   │   ├── auth/                         # Authentication module
│   │   │   ├── dto/                      # Login, Register, 2FA DTOs
│   │   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   │   ├── strategies/               # JWT Strategy
│   │   │   ├── decorators/               # Roles decorator
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── patients/                     # Patients module
│   │   │   ├── dto/                      # CreatePatientDto, UpdatePatientDto
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.service.ts
│   │   │   └── patients.module.ts
│   │   │
│   │   ├── appointments/                 # Appointments module
│   │   │   ├── dto/                      # CreateAppointmentDto, UpdateAppointmentDto
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── appointments.module.ts
│   │   │
│   │   ├── medical-records/              # Medical Records module
│   │   │   ├── dto/                      # CreateMedicalRecordDto, UpdateMedicalRecordDto
│   │   │   ├── medical-records.controller.ts
│   │   │   ├── medical-records.service.ts
│   │   │   └── medical-records.module.ts
│   │   │
│   │   ├── prescriptions/                # Prescriptions module
│   │   │   ├── dto/                      # CreatePrescriptionDto, UpdatePrescriptionDto
│   │   │   ├── prescriptions.controller.ts
│   │   │   ├── prescriptions.service.ts
│   │   │   └── prescriptions.module.ts
│   │   │
│   │   ├── lab-results/                  # Lab Results module
│   │   │   ├── dto/                      # CreateLabResultDto, UpdateLabResultDto
│   │   │   ├── lab-results.controller.ts
│   │   │   ├── lab-results.service.ts
│   │   │   └── lab-results.module.ts
│   │   │
│   │   ├── billing/                      # Billing module
│   │   │   ├── dto/                      # CreateBillingDto, UpdateBillingDto
│   │   │   ├── billing.controller.ts
│   │   │   ├── billing.service.ts
│   │   │   └── billing.module.ts
│   │   │
│   │   ├── users/                        # Users module (for doctor lists)
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   │
│   │   ├── audit/                        # Audit Logging module
│   │   │   ├── decorators/               # SkipAudit decorator
│   │   │   ├── audit.controller.ts
│   │   │   ├── audit.service.ts
│   │   │   ├── audit.interceptor.ts
│   │   │   └── audit.module.ts
│   │   │
│   │   ├── encryption/                   # AES-256-GCM Encryption service
│   │   │   ├── encryption.service.ts
│   │   │   └── encryption.module.ts
│   │   │
│   │   ├── db/                           # Database (Drizzle ORM)
│   │   │   ├── schema/                   # Table definitions
│   │   │   │   ├── index.ts              # Exports all tables + views
│   │   │   │   └── views.ts              # Database views
│   │   │   ├── migrations/               # Migration files
│   │   │   │   ├── 0000_initial.sql
│   │   │   ├── db.module.ts
│   │   │   ├── drizzle.config.ts
│   │   │   └── index.ts                  # Database connection
│   │   │
│   │   ├── common/                       # Shared utilities
│   │   │   ├── filters/                  # Exception filters
│   │   │   └── interceptors/             # Global interceptors
│   │   │
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts                       # Application entry point
│   │
│   ├── scripts/                          # Utility scripts
│   │   ├── seed-dashboard.ts             # Dashboard data seeder
│   │   └── seed.ts                       # Test user seeder
│   │
│   ├── test/                             # Test files
│   │
│   ├── Dockerfile                        # Multi-stage Docker build
│   ├── docker-compose.yml                # Local development setup
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── tsconfig.json
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                             # React + Vite Frontend
│   ├── src/
│   │   ├── api/                          # API client
│   │   │   ├── client.ts                 # Axios instance with interceptors
│   │   │   └── endpoints.ts              # All API endpoint definitions
│   │   │
│   │   ├── pages/                        # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Patients.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── MedicalRecords.tsx
│   │   │   ├── LabResults.tsx
│   │   │   ├── Billing.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── TwoFactorSetup.tsx
│   │   │   ├── Unauthorized.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── components/                   # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── layouts/                      # Layout components
│   │   │   ├── MainLayout.tsx            # Sidebar + Header
│   │   │   └── AuthLayout.tsx            # Login/Register layout
│   │   │
│   │   ├── routes/                       # Route protection
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── store/                        # Zustand state management
│   │   │   └── authStore.ts              # Auth store with persist
│   │   │
│   │   ├── hooks/                        # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useRole.ts
│   │   │
│   │   ├── types/                        # TypeScript interfaces
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                        # Utility functions
│   │   │   └── validation.ts
│   │   │
│   │   ├── App.tsx                       # Main App component
│   │   ├── main.tsx                      # Entry point
│   │   └── index.css                     # Tailwind styles
│   │
│   ├── public/
│   ├── vercel.json                       # Vercel config (rewrites + headers)
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.ts                    # Vite + Tailwind config
│   ├── package.json
│   └── package-lock.json
│
├── terraform/                            # AWS Infrastructure (IaC)
│   ├── main.tf                           # EC2, security group, key pair
│   ├── variables.tf                      # Input variables
│   ├── outputs.tf                        # Outputs (IP, DNS)
│   ├── user-data.sh                      # Docker + Nginx bootstrap
│   ├── docker-compose.yml                # Production compose
│   └── terraform.tfvars.example
│
├── nginx/                                # Nginx configuration
│   └── emr.conf                          # Reverse proxy + SSL config
│
├── .github/                              # GitHub Actions CI/CD
│   └── workflows/
│       ├── deploy-backend.yml            # Build + deploy to EC2
│       └── deploy-frontend.yml           # Deploy frontend to Vercel
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Local Setup

```bash
# Clone
git clone https://github.com/yourusername/emr-system.git
cd emr-system

# Backend
cd backend
cp .env.example .env
npm install
docker-compose up -d postgres
npm run db:generate && npm run db:migrate
npm run start:dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev