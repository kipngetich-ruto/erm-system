import { PartialType } from '@nestjs/mapped-types';
import { CreateLabResultDto } from './create-lab-result.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class UpdateLabResultDto extends PartialType(CreateLabResultDto) {
  @IsOptional()
  @IsString()
  result?: string; // will be encrypted

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;
}