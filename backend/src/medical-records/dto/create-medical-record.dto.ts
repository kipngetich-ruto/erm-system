import { IsString, IsUUID, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  diagnosis: string; // will be encrypted

  @IsString()
  treatment: string; // will be encrypted

  @IsOptional()
  @IsString()
  notes?: string; // will be encrypted

  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsBoolean()
  isFollowUp?: boolean;
}