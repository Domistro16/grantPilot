import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GrantsService } from '../grants/grants.service';
import { ChatRequestDto, MessageDto } from './dto/chat.dto';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private openai: OpenAI;
  private readonly messageLimit = 10; // messages per session

  constructor(
    private configService: ConfigService,
    private grantsService: GrantsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. Agent will not work.');
    }
    this.openai = new OpenAI({ apiKey: apiKey || '' });
  }

  async chat(chatRequest: ChatRequestDto): Promise<{ response: string; conversation_id: string }> {
    const { grant_id, user_message, conversation_history = [] } = chatRequest;

    // Rate limiting: Check conversation history length
    if (conversation_history.length >= this.messageLimit * 2) {
      throw new BadRequestException('Message limit reached. Please start a new conversation.');
    }

    // Fetch grant details
    const grant = await this.grantsService.findOne(grant_id);
    if (!grant) {
      throw new NotFoundException(`Grant with ID ${grant_id} not found`);
    }

    // Build context-aware prompt
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(grant, user_message, conversation_history);

    try {
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...conversation_history.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const assistantResponse = response.choices[0]?.message?.content || 'Unable to generate response.';

      // Generate conversation ID (could be improved with actual session tracking)
      const conversationId = `conv_${Date.now()}_${grant_id}`;

      return {
        response: assistantResponse,
        conversation_id: conversationId,
      };
    } catch (error) {
      this.logger.error('Error calling OpenAI API:', error);

      if (error.status === 401) {
        throw new BadRequestException('Invalid OpenAI API key. Please configure OPENAI_API_KEY.');
      }

      throw new BadRequestException('Failed to generate response. Please try again.');
    }
  }

  private buildSystemPrompt(): string {
    return `You are GrantPilot Agent, an expert advisor for Web3 grant applications. You help builders create compelling grant applications by:
- Understanding their project and matching it to grant requirements
- Identifying strengths to highlight
- Suggesting concrete milestones and budget allocation
- Drafting application responses

You are practical, encouraging, and focused on helping them win funding. Keep responses concise (2-3 paragraphs) and actionable.`;
  }

  private buildUserPrompt(grant: any, userMessage: string, conversationHistory: MessageDto[]): string {
    // If this is the first message in the conversation, include full grant context
    if (conversationHistory.length === 0) {
      return `GRANT CONTEXT:
- Program: ${grant.title}
- Chain: ${grant.chain}
- Category: ${grant.category}
- Amount: ${grant.amount}
- Deadline: ${grant.deadline}
- Focus: ${grant.focus}
- Requirements Summary: ${grant.summary}

USER'S MESSAGE:
${userMessage}

Provide specific, actionable guidance for applying to this grant. Focus on:
1. How well their project fits this grant's focus areas
2. Key strengths to emphasize in their application
3. Specific milestones or deliverables to propose
4. Budget allocation suggestions (if relevant)
5. Any potential gaps they should address`;
    }

    // For follow-up messages, just return the user message
    // (grant context is already in conversation history)
    return userMessage;
  }
}
