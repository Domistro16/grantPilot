import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  role: 'user' | 'assistant';

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsNotEmpty()
  @IsNumber()
  grant_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  user_message: string;

  @IsNotEmpty()
  @IsString()
  wallet_address: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  conversation_history?: MessageDto[];
}

export class ChatResponseDto {
  response: string;
  conversation_id?: string;
}
