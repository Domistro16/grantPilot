import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { GrantSource } from './entities/grant-source.entity';
import { ScraperLog } from './entities/scraper-log.entity';
import { Grant } from '../grants/entities/grant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GrantSource, ScraperLog, Grant]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
