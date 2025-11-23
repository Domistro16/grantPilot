import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
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
  private smtpTransporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.emailProvider = this.configService.get<string>('EMAIL_PROVIDER', 'console');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@grantpilot.com');
    this.emailFromName = this.configService.get<string>('EMAIL_FROM_NAME', 'GrantPilot');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    // Initialize SMTP transporter if SMTP is configured
    if (this.emailProvider === 'smtp') {
      this.initializeSMTP();
    }
  }

  private initializeSMTP() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

    // Debug logging to help diagnose configuration issues
    this.logger.debug(`SMTP Configuration:`);
    this.logger.debug(`  Host: ${smtpHost ? `${smtpHost} (length: ${smtpHost.length})` : 'NOT SET'}`);
    this.logger.debug(`  Port: ${smtpPort}`);
    this.logger.debug(`  Secure: ${smtpSecure}`);
    this.logger.debug(`  User: ${smtpUser ? `${smtpUser} (length: ${smtpUser.length})` : 'NOT SET'}`);
    this.logger.debug(`  Pass: ${smtpPass ? `***${smtpPass.slice(-4)} (length: ${smtpPass.length})` : 'NOT SET'}`);

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Emails will be logged to console.');
      return;
    }

    // Trim values to remove any whitespace or hidden characters
    const trimmedHost = smtpHost.trim();
    const trimmedUser = smtpUser.trim();
    const trimmedPass = smtpPass.trim();

    try {
      this.smtpTransporter = nodemailer.createTransport({
        host: trimmedHost,
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth: {
          user: trimmedUser,
          pass: trimmedPass,
        },
        // Add connection timeout and other options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      this.logger.log(`SMTP transporter initialized: ${trimmedHost}:${smtpPort}`);
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter:', error);
    }
  }

  async verifyConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.smtpTransporter) {
      return {
        success: false,
        message: 'SMTP transporter not initialized. Check your EMAIL_PROVIDER and SMTP credentials.',
      };
    }

    try {
      await this.smtpTransporter.verify();
      return {
        success: true,
        message: 'SMTP connection verified successfully!',
        details: {
          host: this.configService.get<string>('SMTP_HOST')?.trim(),
          port: this.configService.get<number>('SMTP_PORT', 587),
          user: this.configService.get<string>('SMTP_USER')?.trim(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'SMTP connection failed',
        details: {
          error: error.message,
          code: error.code,
          command: error.command,
        },
      };
    }
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
      case 'smtp':
        await this.sendViaSMTP(options);
        break;
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

  private async sendViaSMTP(options: EmailOptions): Promise<void> {
    if (!this.smtpTransporter) {
      this.logger.error('SMTP transporter not initialized. Falling back to console.');
      this.sendViaConsole(options);
      return;
    }

    try {
      const info = await this.smtpTransporter.sendMail({
        from: `"${this.emailFromName}" <${this.emailFrom}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent via SMTP: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send email via SMTP:', error);
      throw error;
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
