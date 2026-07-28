import { IsEmail, IsString, Length } from 'class-validator';

export class Setup2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  totp: string;
}
