import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
import { TokenGateGuard } from '../../common/guards/token-gate.guard';
import { TokenGateService } from '../../common/services/token-gate.service';
import { TOKEN_GATE_CONFIG } from '../../config/token-gate.config';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly tokenGateService: TokenGateService,
  ) {}

  @Get('token-balance')
  @HttpCode(HttpStatus.OK)
  async getTokenBalance(@Query('wallet_address') walletAddress: string) {
    if (!walletAddress) {
      return {
        error: 'Wallet address is required',
        balance: 0,
        hasAccess: false,
        requiredAmount: TOKEN_GATE_CONFIG.REQUIRED_AMOUNT,
        tokenName: TOKEN_GATE_CONFIG.TOKEN_NAME,
        decimals: TOKEN_GATE_CONFIG.DECIMALS,
      };
    }

    const verification = await this.tokenGateService.verifyTokenBalance(walletAddress);

    return {
      balance: verification.balance,
      hasAccess: verification.hasAccess,
      requiredAmount: TOKEN_GATE_CONFIG.REQUIRED_AMOUNT,
      tokenName: TOKEN_GATE_CONFIG.TOKEN_NAME,
      decimals: TOKEN_GATE_CONFIG.DECIMALS,
      error: verification.error || null,
    };
  }

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
