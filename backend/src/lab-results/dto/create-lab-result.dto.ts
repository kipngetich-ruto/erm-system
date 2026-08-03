import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateLabResultDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  testType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}