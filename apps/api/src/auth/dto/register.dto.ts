import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
  @IsString()
  @Length(2, 50)
  @ApiProperty({
    example: 'Kaushik',
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @Matches(/^[0-9]{10}$/)
  @ApiProperty({
    example: '9876543210',
  })
  mobile: string;

  @IsString()
  @ApiProperty({
    example: '+91',
  })
  countryCode: string;

  @Length(6, 20)
  password: string;
}
