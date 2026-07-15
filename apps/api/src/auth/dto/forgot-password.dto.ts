import { IsMobilePhone, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  countryCode: string;

  @IsMobilePhone()
  mobile: string;
}
