import { Module } from '@nestjs/common';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [LabResultsController],
  providers: [LabResultsService],
})
export class LabResultsModule {}