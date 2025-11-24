import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CreateGrantDto } from '../grants/dto/create-grant.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.openai = new OpenAI({ apiKey });
  }

  async extractGrantData(content: string): Promise<CreateGrantDto | null> {
    try {
      const systemPrompt =
        'You are a grant data extractor. Extract structured information from Web3 grant announcements.';

      const userPrompt = `Extract the following from this grant announcement:
- title: Official grant program name
- chain: Blockchain name(s) - use standard names like 'BNB Chain', 'Solana', 'Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism', 'Aptos', 'Sui', 'Near', 'Scroll'. If multiple, use the primary one or 'Multichain'
- category: Choose ONE: 'Infra', 'DeFi', 'Gaming', 'Consumer', 'Public Goods', 'Ecosystem', 'Tooling', 'ZK', 'L2 Infra', 'Hackathons'
- tag: Create a short tag like 'Infra · DeFi · Tooling' (max 3 items)
- amount: Funding range as shown (e.g., 'Up to $150k', '$5k - $50k', 'Varies')
- status: 'Open', 'Upcoming', or 'Closed'
- deadline: Exact date or 'Rolling' or estimated quarter
- summary: 2-3 sentence summary of what the grant supports
- focus: 1-2 sentences on ideal applicant profile
- fit_score: (OPTIONAL) Short assessment like 'Strong for DeFi builders' or 'Good for early-stage teams' or 'Ideal for infrastructure projects'
- fit_description: (OPTIONAL) 1 sentence explaining who this grant is best suited for
- time_to_apply: (OPTIONAL) Estimated time like '30-45 minutes' or '2-3 hours' or '1-2 weeks'
- time_to_apply_description: (OPTIONAL) 1 sentence about what's needed (e.g., 'Requires pitch deck and metrics' or 'Simple online form')

IMPORTANT: fit_score, fit_description, time_to_apply, and time_to_apply_description are OPTIONAL. Only include them if you can make a reasonable estimate based on the grant requirements and application process described in the content.

Return ONLY valid JSON with these keys. No markdown, no explanation.

${content}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const result = response.choices[0]?.message?.content;

      if (!result) {
        this.logger.error('No response from OpenAI');
        return null;
      }

      // Parse JSON response
      const grantData = JSON.parse(result.trim());

      // Validate required fields
      if (
        !grantData.title ||
        !grantData.chain ||
        !grantData.category ||
        !grantData.status
      ) {
        this.logger.error('Missing required fields in GPT response');
        return null;
      }

      return grantData as CreateGrantDto;
    } catch (error) {
      this.logger.error('Error extracting grant data with GPT-4', error);
      return null;
    }
  }
}
