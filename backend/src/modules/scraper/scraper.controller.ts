import { Controller, Post, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@Controller('scraper')
@UseGuards(AdminAuthGuard)
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  async runScraper(): Promise<{
    grants_added: number;
    grants_updated: number;
  }> {
    return this.scraperService.scrapeAll();
  }
}
