import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';

class TestEmailDto {
  email: string;
  type: 'confirmation' | 'deadline' | 'update';
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  async testEmail(@Body() dto: TestEmailDto) {
    const { email, type } = dto;

    if (!email || !type) {
      throw new BadRequestException('Email and type are required');
    }

    // Mock grant data for testing
    const mockGrant = {
      id: 1,
      title: 'Test Grant Program',
      chain: 'BNB Chain',
      category: 'DeFi',
      amount: 'Up to $50,000',
      deadline: 'December 31, 2025',
      status: 'Open',
      summary: 'This is a test grant program for DeFi builders on BNB Chain.',
      focus: 'Teams building innovative DeFi protocols.',
      link: 'https://example.com/grant',
      source_url: 'https://example.com/grant',
    };

    const mockToken = 'test-unsubscribe-token-12345';

    let result: boolean;

    switch (type) {
      case 'confirmation':
        result = await this.emailService.sendSubscriptionConfirmation(email, mockGrant, mockToken);
        break;
      case 'deadline':
        result = await this.emailService.sendDeadlineReminder(email, mockGrant, 7, mockToken);
        break;
      case 'update':
        result = await this.emailService.sendGrantUpdate(
          email,
          mockGrant,
          'Deadline',
          'December 15, 2025',
          'December 31, 2025',
          mockToken,
        );
        break;
      default:
        throw new BadRequestException('Invalid email type');
    }

    return {
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
    };
  }
}
