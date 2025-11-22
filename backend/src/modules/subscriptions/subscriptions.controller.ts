import { Controller, Post, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('grants/subscribe')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async subscribe(
    @Body() subscribeDto: SubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.subscriptionsService.subscribe(subscribeDto);
  }
}
