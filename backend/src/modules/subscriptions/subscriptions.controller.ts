import { Controller, Post, Body, Get, Query, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('grants')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  async subscribe(
    @Body() subscribeDto: SubscribeDto,
  ): Promise<{ success: boolean; message: string; subscription_id: number }> {
    return this.subscriptionsService.subscribe(subscribeDto);
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      return res.status(400).send('<h1>Invalid unsubscribe link</h1>');
    }

    try {
      await this.subscriptionsService.unsubscribe(token);

      // Load and serve the unsubscribe HTML template
      const templatePath = path.join(__dirname, '../../email/templates/unsubscribe.html');
      let html = fs.readFileSync(templatePath, 'utf-8');

      // Replace homeUrl variable
      const homeUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      html = html.replace(/{{homeUrl}}/g, homeUrl);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(400).send('<h1>Error</h1><p>Invalid or expired unsubscribe link.</p>');
    }
  }

  @Get(':id/subscription-status')
  async getSubscriptionStatus(
    @Param('id') id: string,
    @Query('email') email: string,
  ): Promise<{ isSubscribed: boolean; subscription_id: number | null }> {
    const grantId = parseInt(id, 10);
    return this.subscriptionsService.getSubscriptionStatus(grantId, email);
  }
}
