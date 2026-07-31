import { IsEmail, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  fullName!: string;

  @IsDateString()
  dob!: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;
}