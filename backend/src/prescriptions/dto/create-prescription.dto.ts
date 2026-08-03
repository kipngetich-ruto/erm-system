import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  medication: string; // will be encrypted

  @IsString()
  dosage: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}