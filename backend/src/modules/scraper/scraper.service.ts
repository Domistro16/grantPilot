import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as puppeteer from 'puppeteer';
import { AiService } from '../ai/ai.service';
import { GrantsService } from '../grants/grants.service';

interface ScrapeSource {
  name: string;
  url: string;
  selector?: string;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  private readonly sources: ScrapeSource[] = [
    {
      name: 'BNB Chain Grants',
      url: 'https://www.bnbchain.org/en/blog/bnb-chain-grants-program',
    },
    {
      name: 'Solana Grants',
      url: 'https://solana.org/grants',
    },
    {
      name: 'Polygon Village',
      url: 'https://polygon.technology/village/grants',
    },
    {
      name: 'Base',
      url: 'https://paragraph.xyz/@base/calling-based-builders',
    },
    {
      name: 'Ethereum Foundation',
      url: 'https://esp.ethereum.foundation/',
    },
  ];

  constructor(
    private aiService: AiService,
    private grantsService: GrantsService,
  ) {}

  @Cron('0 2 * * *', {
    name: 'daily-grant-scraping',
    timeZone: 'UTC',
  })
  async handleDailyScraping() {
    this.logger.log('Running scheduled grant scraping (2 AM UTC)...');
    await this.scrapeAll();
  }

  async scrapeAll(): Promise<{ grants_added: number; grants_updated: number }> {
    let grantsAdded = 0;
    let grantsUpdated = 0;

    this.logger.log('Starting grant scraping process...');

    let browser: puppeteer.Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      for (const source of this.sources) {
        this.logger.log(`Scraping ${source.name} from ${source.url}`);

        try {
          const content = await this.scrapePage(browser, source.url);

          if (!content) {
            this.logger.warn(`No content extracted from ${source.name}`);
            continue;
          }

          // Extract grant data using AI
          const grantData = await this.aiService.extractGrantData(content);

          if (!grantData) {
            this.logger.warn(`Failed to extract grant data from ${source.name}`);
            continue;
          }

          // Add source URL
          grantData.source_url = source.url;

          // Check if grant already exists
          const existingGrants = await this.grantsService.findAll({});
          const exists = existingGrants.find(
            (g) => g.title === grantData.title && g.link === grantData.link,
          );

          if (exists) {
            await this.grantsService.update(exists.id, grantData);
            grantsUpdated++;
            this.logger.log(`Updated grant: ${grantData.title}`);
          } else {
            await this.grantsService.create(grantData);
            grantsAdded++;
            this.logger.log(`Added new grant: ${grantData.title}`);
          }
        } catch (error) {
          this.logger.error(`Error scraping ${source.name}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error('Error during scraping process:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    this.logger.log(
      `Scraping complete. Added: ${grantsAdded}, Updated: ${grantsUpdated}`,
    );

    return { grants_added: grantsAdded, grants_updated: grantsUpdated };
  }

  private async scrapePage(
    browser: puppeteer.Browser,
    url: string,
  ): Promise<string | null> {
    let page: puppeteer.Page | null = null;

    try {
      page = await browser.newPage();

      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Extract main content
      const content = await page.evaluate(() => {
        // Try to find main content area
        const main =
          document.querySelector('main') ||
          document.querySelector('article') ||
          document.querySelector('[role="main"]') ||
          document.body;

        return main?.innerText || '';
      });

      return content;
    } catch (error) {
      this.logger.error(`Error scraping page ${url}:`, error.message);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}
