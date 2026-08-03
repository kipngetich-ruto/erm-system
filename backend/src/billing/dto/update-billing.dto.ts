import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingDto } from './create-billing.dto';
import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';

export class UpdateBillingDto extends PartialType(CreateBillingDto) {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}