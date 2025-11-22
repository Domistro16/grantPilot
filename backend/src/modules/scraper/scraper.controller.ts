import { Controller, Post, Get, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Trigger manual scrape of all sources (Admin only)' })
  async runScraper() {
    return this.scraperService.scrapeAllSources();
  }

  @Post('sources/:id/scrape')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Scrape a single source by ID (Admin only)' })
  async scrapeSource(@Param('id', ParseIntPipe) id: number) {
    return this.scraperService.scrapeSource(id);
  }

  @Get('sources')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get all grant sources (Admin only)' })
  async getSources() {
    return this.scraperService.getAllSources();
  }

  @Get('logs')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get recent scraper logs (Admin only)' })
  async getLogs() {
    return this.scraperService.getRecentLogs();
  }
}
