import { IsMobilePhone, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  countryCode: string;

  @IsMobilePhone()
  mobile: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsString()
  @MinLength(6)
  password: string;
}
