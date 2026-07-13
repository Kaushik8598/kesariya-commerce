import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @Matches(/^[0-9]{10}$/)
  mobile: string;

  @IsString()
  countryCode: string;

  @Length(6, 20)
  password: string;
}
