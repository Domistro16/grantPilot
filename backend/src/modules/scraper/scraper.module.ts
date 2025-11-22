import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { AiModule } from '../ai/ai.module';
import { GrantsModule } from '../grants/grants.module';

@Module({
  imports: [ScheduleModule.forRoot(), AiModule, GrantsModule],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
