import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  countryCode: string;

  @IsString()
  mobile: string;

  @Length(6, 20)
  password: string;
}
