import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const result = await this.agentService.chat(chatRequest);
    return {
      response: result.response,
      conversation_id: result.conversation_id,
    };
  }
}
