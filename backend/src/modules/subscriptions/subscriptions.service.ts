import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { GrantsService } from '../grants/grants.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(UserSubscription)
    private subscriptionsRepository: Repository<UserSubscription>,
    private grantsService: GrantsService,
  ) {}

  async subscribe(
    subscribeDto: SubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
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
      return {
        success: true,
        message: 'Already subscribed to this grant',
      };
    }

    // Create subscription
    const subscription = this.subscriptionsRepository.create({
      user_email: subscribeDto.email,
      grant_id: subscribeDto.grant_id,
    });

    await this.subscriptionsRepository.save(subscription);

    return {
      success: true,
      message: 'Successfully subscribed to grant updates',
    };
  }
}
