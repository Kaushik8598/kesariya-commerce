import { IsMobilePhone, IsString, Length } from 'class-validator';

export class VerifyForgotPasswordOtpDto {
  @IsString()
  countryCode: string;

  @IsMobilePhone()
  mobile: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
