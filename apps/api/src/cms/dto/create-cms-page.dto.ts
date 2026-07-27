import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCmsPageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
