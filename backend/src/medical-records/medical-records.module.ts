import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}