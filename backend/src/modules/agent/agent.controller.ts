import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
import { TokenGateGuard } from '../../common/guards/token-gate.guard';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenGateGuard)
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const result = await this.agentService.chat(chatRequest);
    return {
      response: result.response,
      conversation_id: result.conversation_id,
    };
  }
}
