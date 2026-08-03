import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { EncryptionModule } from './encryption/encryption.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { AuditModule } from './audit/audit.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LabResultsModule } from './lab-results/lab-results.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DbModule,
    EncryptionModule,
    AuthModule,
    DashboardModule,
    PatientsModule,
    AppointmentsModule,
    UsersModule,
    MedicalRecordsModule,
    AuditModule,
    PrescriptionsModule,
    LabResultsModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
