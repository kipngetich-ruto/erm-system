import { IsString } from 'class-validator';

export class UploadResultDto {
  @IsString()
  result: string; // plaintext result to encrypt
}