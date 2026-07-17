import { IsMobilePhone, IsString } from 'class-validator';

export class ResendRegistrationOtpDto {
  @IsString()
  countryCode: string;

  @IsMobilePhone()
  mobile: string;
}
