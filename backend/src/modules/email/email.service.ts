import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly emailProvider: string;
  private readonly emailFrom: string;
  private readonly emailFromName: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.emailProvider = this.configService.get<string>('EMAIL_PROVIDER', 'console');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@grantpilot.com');
    this.emailFromName = this.configService.get<string>('EMAIL_FROM_NAME', 'GrantPilot');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  async sendSubscriptionConfirmation(email: string, grant: any, unsubscribeToken: string): Promise<boolean> {
    try {
      const subject = `Subscribed to ${grant.title}`;

      const unsubscribeUrl = `${this.frontendUrl}/unsubscribe?token=${unsubscribeToken}`;
      const grantUrl = grant.link || grant.source_url;

      const html = this.loadTemplate('subscription-confirmation.html', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantStatus: grant.status,
        grantUrl,
        unsubscribeUrl,
      });

      const text = this.loadTemplate('subscription-confirmation.txt', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantStatus: grant.status,
        grantUrl,
        unsubscribeUrl,
      });

      await this.sendEmail({ to: email, subject, html, text });
      this.logger.log(`Sent subscription confirmation to ${email} for grant: ${grant.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send subscription confirmation to ${email}:`, error);
      return false;
    }
  }

  async sendDeadlineReminder(email: string, grant: any, daysLeft: number, unsubscribeToken: string): Promise<boolean> {
    try {
      const subject = `⏰ ${daysLeft} day${daysLeft > 1 ? 's' : ''} left: ${grant.title}`;

      const unsubscribeUrl = `${this.frontendUrl}/unsubscribe?token=${unsubscribeToken}`;
      const grantUrl = grant.link || grant.source_url;
      const daysLeftText = daysLeft === 1 ? '1 day left' : `${daysLeft} days left`;

      const html = this.loadTemplate('deadline-reminder.html', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantEligibility: grant.focus,
        daysLeft: daysLeftText,
        grantUrl,
        unsubscribeUrl,
      });

      const text = this.loadTemplate('deadline-reminder.txt', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantEligibility: grant.focus,
        daysLeft: daysLeftText,
        grantUrl,
        unsubscribeUrl,
      });

      await this.sendEmail({ to: email, subject, html, text });
      this.logger.log(`Sent ${daysLeft}-day reminder to ${email} for grant: ${grant.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send deadline reminder to ${email}:`, error);
      return false;
    }
  }

  async sendGrantUpdate(
    email: string,
    grant: any,
    changeType: string,
    oldValue: string,
    newValue: string,
    unsubscribeToken: string,
  ): Promise<boolean> {
    try {
      const subject = `Grant Updated: ${grant.title}`;

      const unsubscribeUrl = `${this.frontendUrl}/unsubscribe?token=${unsubscribeToken}`;
      const grantUrl = grant.link || grant.source_url;

      const html = this.loadTemplate('grant-update.html', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantStatus: grant.status,
        grantEligibility: grant.focus,
        changeType,
        oldValue,
        newValue,
        grantUrl,
        unsubscribeUrl,
      });

      const text = this.loadTemplate('grant-update.txt', {
        grantTitle: grant.title,
        grantChain: grant.chain,
        grantAmount: grant.amount,
        grantDeadline: grant.deadline,
        grantStatus: grant.status,
        grantEligibility: grant.focus,
        changeType,
        oldValue,
        newValue,
        grantUrl,
        unsubscribeUrl,
      });

      await this.sendEmail({ to: email, subject, html, text });
      this.logger.log(`Sent grant update to ${email} for grant: ${grant.title} (${changeType})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send grant update to ${email}:`, error);
      return false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    switch (this.emailProvider) {
      case 'console':
        this.sendViaConsole(options);
        break;
      case 'sendgrid':
        await this.sendViaSendGrid(options);
        break;
      default:
        this.logger.warn(`Unknown email provider: ${this.emailProvider}. Falling back to console.`);
        this.sendViaConsole(options);
    }
  }

  private sendViaConsole(options: EmailOptions): void {
    this.logger.log('\n====== EMAIL (Console) ======');
    this.logger.log(`From: ${this.emailFromName} <${this.emailFrom}>`);
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log('----------------------------');
    this.logger.log(options.text);
    this.logger.log('============================\n');
  }

  private async sendViaSendGrid(options: EmailOptions): Promise<void> {
    // Placeholder for SendGrid implementation
    // You'll need to install @sendgrid/mail and implement this
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY not configured. Falling back to console.');
      this.sendViaConsole(options);
      return;
    }

    // TODO: Implement SendGrid integration
    this.logger.warn('SendGrid integration not yet implemented. Falling back to console.');
    this.sendViaConsole(options);
  }

  private loadTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      const templatePath = path.join(__dirname, 'templates', templateName);
      let template = fs.readFileSync(templatePath, 'utf-8');

      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
      });

      return template;
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      return `Error loading email template: ${templateName}`;
    }
  }
}
