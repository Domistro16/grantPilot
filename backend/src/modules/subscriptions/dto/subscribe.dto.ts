import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class SubscribeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  grant_id: number;
}
