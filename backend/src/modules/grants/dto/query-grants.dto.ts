import { IsOptional, IsString, IsEnum } from 'class-validator';
import { GrantStatus } from '../entities/grant.entity';

export class QueryGrantsDto {
  @IsOptional()
  @IsString()
  chain?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(GrantStatus)
  status?: GrantStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
