# Secure Electronic Medical Records (EMR) System Architecture

> **Project:** Secure Electronic Medical Records (EMR) System  
> **Course:** ISC 6220 – Advanced Cryptography  
> **Architecture Version:** 1.0

---

# 1. Overview

The Secure Electronic Medical Records (EMR) System is a modern, security-first web application designed to securely manage patient health information while ensuring confidentiality, integrity, and availability (CIA).

The system implements industry security best practices including:

- Role-Based Access Control (RBAC)
- Multi-Factor Authentication (2FA)
- Strong password hashing
- End-to-end secure communication
- Encryption of sensitive medical information
- Audit logging
- Secure REST APIs
- Database normalization (3NF)

The architecture follows a layered design that separates presentation, business logic, security, and persistence, making the application scalable, maintainable, and secure.

---

## Technology Stack

| Layer | Technology |
|---------|------------|
| Frontend | React + Vite |
| Backend | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| API | REST API |
| Authentication | JWT Access Token + Refresh Token + TOTP 2FA |
| Authorization | Role-Based Access Control (RBAC) |
| Password Hashing | Argon2id |
| Data Encryption | AES-256-GCM |
| Validation | Zod (Frontend), class-validator (Backend) |
| Logging | Winston + PostgreSQL Audit Logs |
| Frontend Hosting | Vercel |
| Backend Hosting | AWS EC2 |
| Containerization | Docker Compose |
| Reverse Proxy | Nginx |
| Secure Communication | HTTPS (TLS 1.3) |

---
# 2. System Analysis & Design

## System Users

The system supports the following user roles:

- Administrator
- Doctor
- Nurse
- Pharmacist
- Laboratory Technician
- Receptionist
- Billing Officer

## Information Classification

| Classification | Examples | Protection |
|---------------|----------|------------|
| Public | Hospital name, departments, contact information | No special protection required |
| Confidential | Patient names, phone numbers, appointment schedules | Access controlled |
| Sensitive | Diagnoses, medical history, prescriptions, laboratory results, billing information | Encrypted using AES-256-GCM and protected by RBAC |

# 3. High-Level Architecture

```text
                    ┌──────────────────────────┐
                    │        Web Browser       │
                    └─────────────┬────────────┘
                                  │
                           HTTPS (TLS 1.3)
                                  │
            ┌─────────────────────┴──────────────────────┐
            ▼                                            ▼
    ┌──────────────────┐                      ┌────────────────────┐
    │ React Frontend   │                      │ AWS EC2 Instance   │
    │ (Vercel)         │──────HTTPS REST────▶│ Nginx Reverse Proxy│
    └──────────────────┘                      └─────────┬──────────┘
                                                       │
                                                ┌──────▼───────┐
                                                │  NestJS API  │
                                                └──────┬───────┘
                                                       │
                                               Encryption Service
                                                       │
                                                  Drizzle ORM
                                                       │
                                                PostgreSQL
```
---

# 4. Frontend Architecture

The frontend is developed using React and Vite and communicates with the backend exclusively through secure REST APIs.

### Responsibilities

- User Authentication
- Patient Registration
- Appointment Scheduling
- Medical Record Management
- Prescription Management
- Laboratory Results
- Billing
- User Administration
- Dashboard
- Two-Factor Authentication

### Frontend Structure

```
frontend/

src/
│
├── api/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── types/
├── utils/
└── App.tsx
```

---

# 5. Backend Architecture

The backend follows a modular architecture using NestJS.

Each module encapsulates its own controllers, services, DTOs, and database logic.

```
backend/

src/

├── auth/
├── users/
├── roles/
├── patients/
├── appointments/
├── medical-records/
├── prescriptions/
├── laboratory/
├── billing/
├── audit/
├── encryption/
├── common/
├── database/
└── main.ts
```

---

# 6. Core Modules

## Authentication Module

Responsibilities

- User Login
- User Logout
- JWT Generation
- Refresh Token Rotation
- Password Reset
- Two-Factor Authentication
- Password Hashing

Security

- Argon2id password hashing
- JWT Access Tokens
- Hashed Refresh Tokens
- TOTP Authentication

---

## Users Module

Responsibilities

- User Management
- Role Assignment
- Account Status
- Profile Management

---

## Patients Module

Responsibilities

- Register Patients
- Update Patient Information
- Search Patients

---

## Medical Records Module

Responsibilities

- Create Medical Records
- Update Medical Records
- Encrypt Sensitive Fields
- Retrieve Medical Records

---

## Appointment Module

Responsibilities

- Schedule Appointments
- Update Appointments
- Cancel Appointments

---

## Prescription Module

Responsibilities

- Create Prescriptions
- View Prescriptions
- Dispense Medication

---

## Laboratory Module

Responsibilities

- Request Tests
- Upload Results
- View Laboratory Reports

---

## Billing Module

Responsibilities

- Generate Invoices
- Record Payments
- Billing Reports

---

## Audit Module

Responsibilities

- Record User Activities
- Security Monitoring
- Compliance Reporting

---

# 7. Security Architecture

The system follows a defense-in-depth security model.

```text
Request

↓

HTTPS (TLS 1.3)

↓

Nginx Reverse Proxy

↓

JWT Authentication

↓

Two-Factor Authentication

↓

RBAC Authorization

↓

Request Validation

↓

Business Logic

↓

AES-256-GCM Encryption

↓

PostgreSQL
```

Security is enforced at multiple layers to protect against unauthorized access, data tampering, and information disclosure.

# 8. Database Architecture

The database is normalized to Third Normal Form (3NF).

## Tables

```
users
roles
permissions
user_roles

patients

medical_records

appointments

prescriptions

medications

laboratory_tests

lab_results

billing

payments

refresh_tokens

audit_logs
```

### 3NF Justification

The database satisfies Third Normal Form (3NF) because:

- Every table has a primary key.
- All non-key attributes depend entirely on the primary key.
- There are no transitive dependencies between non-key attributes.
- Data redundancy is minimized through proper table relationships and foreign keys.

---

# 9. Entity Relationships

```
Users
│
├── User Roles
│
└── Audit Logs

Roles
│
└── Permissions

Patients
│
├── Medical Records
├── Appointments
├── Prescriptions
├── Laboratory Tests
├── Billing
└── Payments

Doctors
│
├── Medical Records
├── Prescriptions
└── Appointments

Laboratory Technician
│
└── Laboratory Results
```

---

# 10. Authentication Flow

```
User

↓

Login Request

↓

Validate Credentials

↓

Argon2 Password Verification

↓

2FA Verification

↓

Generate JWT Access Token

↓

Generate Refresh Token

↓

Return Secure Authentication Response
```

---

# 11. Authorization Flow

```
Incoming Request

↓

JWT Authentication Guard

↓

Extract User

↓

RBAC Guard

↓

Permission Check

↓

Business Logic

↓

Database Access
```

---

# 12. Encryption Architecture

Sensitive application data is selectively encrypted before being stored in the database using AES-256-GCM. Non-sensitive relational data remains unencrypted to preserve indexing, querying, and referential integrity.

## Encryption Algorithm

AES-256-GCM

## Encrypted Fields

- Diagnosis
- Medical History
- Treatment Notes
- Laboratory Results
- Prescription Notes

## Non-Encrypted Fields

- Primary Keys
- Foreign Keys
- User IDs
- Appointment Dates
- Status Fields

Encryption keys are stored outside the database using secure environment variables.

---

# 13. Password Security

Passwords are never stored in plaintext.

The system uses:

- Argon2id
- Random Salt
- Configurable Memory Cost
- Configurable Time Cost

Passwords are verified using Argon2's secure verification function.

---

# 14. Role-Based Access Control (RBAC)

The RBAC model separates users, roles, and permissions.

```
Users

↓

User Roles

↓

Roles

↓

Permissions

↓

Protected Resources
```

### RBAC Permission Matrix

| Role | Patients | Medical Records | Prescriptions | Lab Results | Billing | Audit Logs |
|------|----------|-----------------|--------------|------------|---------|-----------|
| Administrator | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| Doctor | Read | Create, Read, Update | Create, Read | Read | Read | — |
| Nurse | Read | Read, Update (Vitals) | — | — | — | — |
| Pharmacist | Read | — | Read, Update | — | — | — |
| Laboratory Technician | Read | — | — | Create, Read, Update | — | — |
| Receptionist | Create, Read, Update | — | — | — | — | — |
| Billing Officer | Read | — | — | — | Create, Read, Update | — |

---

# 15. Audit Logging

The system records security-critical events.

Examples include:

- Login
- Logout
- Failed Login
- Password Change
- User Creation
- Patient Registration
- Medical Record Creation
- Medical Record Update
- Prescription Issued
- Laboratory Result Upload
- Billing Update
- Permission Changes

Each log records:

- User ID
- Timestamp
- Action
- IP Address
- Resource
- Status

---

# 16. Secure Communication

All communication between client and server uses HTTPS.

Security mechanisms include:

- TLS 1.3
- Secure Cookies
- HTTP Security Headers
- HSTS
- Content Security Policy
- CORS Protection

---

# 17. API Security

Security controls include:

- JWT Authentication
- RBAC Authorization
- Request Validation
- Rate Limiting
- Input Sanitization
- SQL Injection Prevention
- XSS Protection
- CSRF Protection (where applicable)
- Secure Error Handling
- CORS configured to allow requests only from the Vercel frontend domain.

---

# 18. Deployment Architecture

The application follows a distributed deployment model where the frontend and backend are hosted independently.

```text
                    Internet
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   Vercel Platform              AWS EC2 Instance
   React + Vite                 Ubuntu Server
                                     │
                                 Nginx
                                     │
                                 NestJS API
                                     │
                               Drizzle ORM
                                     │
                               PostgreSQL
```

## Frontend Deployment

- React application hosted on Vercel.
- Static assets distributed through Vercel's global CDN.
- Environment variables configured through the Vercel dashboard.
- Production build generated using Vite.

## Backend Deployment

- NestJS application deployed on an AWS EC2 Ubuntu instance.
- Nginx serves as the reverse proxy.
- HTTPS enabled using TLS certificates.
- Backend exposes REST APIs consumed by the React frontend.

## Database Deployment

- PostgreSQL runs on the EC2 instance.
- Database is accessible only from the backend application.
- No public database access is permitted.

## Communication

Frontend → Backend communication occurs over HTTPS using REST APIs.

All sensitive data is transmitted through encrypted TLS connections.

---
# 19. Environment Configuration

Sensitive configuration values are managed using environment variables.

Examples include:

- JWT Secret
- Refresh Token Secret
- AES Encryption Key
- Database Connection URL
- TOTP Secret Configuration
- SMTP Credentials
- Application URLs

Secrets are never committed to source control.

## 20. Infrastructure Security

The deployment infrastructure incorporates additional security measures:

- HTTPS enforced across all services.
- Nginx terminates TLS connections.
- Backend API accessible only through Nginx.
- PostgreSQL is not publicly exposed.
- Environment variables store secrets and encryption keys.
- Security groups restrict inbound network access.
- JWT authentication protects all secured endpoints.

# 21. Security Principles

The architecture is designed around the following security principles:

- Confidentiality through AES-256-GCM encryption and RBAC.
- Integrity through authenticated encryption, validation, and audit logging.
- Availability through modular design and secure deployment.
- Least Privilege by granting only the minimum permissions required for each role.
- Defense in Depth using multiple layers of security controls.
- Accountability through comprehensive audit logging.
- Secure by Default through encrypted communication, strong authentication, and hardened configuration.

---

# 22. Compliance Considerations

The architecture aligns with widely recognized healthcare security practices by incorporating:

- Strong authentication
- Role-based authorization
- Encryption of sensitive medical data
- Secure communication using TLS
- Audit logging for accountability
- Least-privilege access control
- Database normalization and integrity constraints

These measures support the secure handling of electronic medical records while meeting the security objectives of the Advanced Cryptography project.