import { IsEmail } from 'class-validator';

export class Generate2FADto {
  @IsEmail()
  email: string;
}