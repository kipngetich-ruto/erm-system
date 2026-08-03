import { IsUUID, IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateBillingDto {
  @IsUUID()
  patientId: string;

  @IsString()
  invoiceNumber: string; // unique

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}