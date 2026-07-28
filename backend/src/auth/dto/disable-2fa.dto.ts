import { IsEmail, IsString, Length } from 'class-validator';

export class Disable2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  totp: string;
}