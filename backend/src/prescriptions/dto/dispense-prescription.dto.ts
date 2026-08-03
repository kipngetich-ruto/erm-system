import { IsUUID, IsOptional, IsString } from 'class-validator';

export class DispensePrescriptionDto {
  @IsUUID()
  pharmacistId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}