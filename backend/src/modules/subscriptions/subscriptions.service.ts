import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { GrantsService } from '../grants/grants.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(UserSubscription)
    private subscriptionsRepository: Repository<UserSubscription>,
    private grantsService: GrantsService,
    private emailService: EmailService,
  ) {}

  async subscribe(
    subscribeDto: SubscribeDto,
  ): Promise<{ success: boolean; message: string; subscription_id: number }> {
    // Check if grant exists
    const grant = await this.grantsService.findOne(subscribeDto.grant_id);

    if (!grant) {
      throw new BadRequestException('Grant not found');
    }

    // Check if already subscribed
    const existing = await this.subscriptionsRepository.findOne({
      where: {
        user_email: subscribeDto.email,
        grant_id: subscribeDto.grant_id,
      },
    });

    if (existing) {
      // If already subscribed but inactive, reactivate
      if (!existing.is_active) {
        existing.is_active = true;
        existing.unsubscribe_token = uuidv4();
        await this.subscriptionsRepository.save(existing);

        // Send confirmation email
        await this.emailService.sendSubscriptionConfirmation(
          existing.user_email,
          grant,
          existing.unsubscribe_token,
        );

        return {
          success: true,
          message: 'Subscription reactivated',
          subscription_id: existing.id,
        };
      }

      return {
        success: true,
        message: 'Already subscribed to this grant',
        subscription_id: existing.id,
      };
    }

    // Create subscription with UUID token
    const subscription = this.subscriptionsRepository.create({
      user_email: subscribeDto.email,
      grant_id: subscribeDto.grant_id,
      is_active: true,
      unsubscribe_token: uuidv4(),
    });

    await this.subscriptionsRepository.save(subscription);

    // Send confirmation email
    try {
      await this.emailService.sendSubscriptionConfirmation(
        subscription.user_email,
        grant,
        subscription.unsubscribe_token!,
      );
    } catch (error) {
      this.logger.error('Failed to send confirmation email:', error);
      // Don't fail the subscription if email fails
    }

    return {
      success: true,
      message: 'Successfully subscribed to grant updates',
      subscription_id: subscription.id,
    };
  }

  async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { unsubscribe_token: token },
    });

    if (!subscription) {
      throw new BadRequestException('Invalid unsubscribe token');
    }

    subscription.is_active = false;
    await this.subscriptionsRepository.save(subscription);

    return {
      success: true,
      message: 'Successfully unsubscribed',
    };
  }

  async getSubscriptionStatus(grantId: number, email: string): Promise<{ isSubscribed: boolean; subscription_id: number | null }> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        user_email: email,
        grant_id: grantId,
        is_active: true,
      },
    });

    return {
      isSubscribed: !!subscription,
      subscription_id: subscription?.id || null,
    };
  }

  async getActiveSubscriptionsByGrant(grantId: number): Promise<UserSubscription[]> {
    return this.subscriptionsRepository.find({
      where: {
        grant_id: grantId,
        is_active: true,
      },
      relations: ['grant'],
    });
  }

  async updateReminderSent(subscriptionId: number, reminderType: '7day' | '1day'): Promise<void> {
    const updateData = {
      last_notified_at: new Date(),
      ...(reminderType === '7day' ? { seven_day_reminder_sent: true } : { one_day_reminder_sent: true }),
    };

    await this.subscriptionsRepository.update(subscriptionId, updateData);
  }
}
