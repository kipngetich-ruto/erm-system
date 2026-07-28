import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'billing'])
  role?: string;
}
