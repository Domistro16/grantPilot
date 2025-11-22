import { IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { GrantStatus } from '../entities/grant.entity';

export class CreateGrantDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  chain: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  category: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  tag: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  amount: string;

  @IsNotEmpty()
  @IsEnum(GrantStatus)
  status: GrantStatus;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  deadline: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsNotEmpty()
  @IsString()
  focus: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  source_url: string;
}
