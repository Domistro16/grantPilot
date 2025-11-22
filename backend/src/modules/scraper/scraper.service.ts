import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { GrantSource, ScrapeStrategy } from './entities/grant-source.entity';
import { ScraperLog } from './entities/scraper-log.entity';
import { Grant, GrantStatus } from '../grants/entities/grant.entity';

interface ExtractedGrant {
  title: string;
  chain: string;
  category: string;
  tag: string;
  amount: string;
  status: string;
  deadline: string;
  summary: string;
  focus: string;
  link: string;
  fit_score?: string;
  fit_description?: string;
  time_to_apply?: string;
  time_to_apply_description?: string;
}

export interface ScrapeResult {
  sources_scraped: number;
  grants_added: number;
  grants_updated: number;
  errors: string[];
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private openai: OpenAI;

  constructor(
    @InjectRepository(GrantSource)
    private grantSourceRepo: Repository<GrantSource>,
    @InjectRepository(ScraperLog)
    private scraperLogRepo: Repository<ScraperLog>,
    @InjectRepository(Grant)
    private grantRepo: Repository<Grant>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey: apiKey || '' });
  }

  /**
   * Scheduled scraping - Daily at 2 AM UTC
   */
  @Cron('0 2 * * *', { name: 'daily-scraping', timeZone: 'UTC' })
  async scheduledScrapeAll() {
    this.logger.log('⏰ Running scheduled scrape...');
    await this.scrapeAllSources();
  }

  /**
   * Scheduled cleanup - Every week
   */
  @Cron(CronExpression.EVERY_WEEK, { name: 'weekly-cleanup' })
  async scheduledCleanup() {
    this.logger.log('🧹 Running scheduled cleanup...');
    await this.deactivateStaleGrants();
  }

  /**
   * Scrape all active grant sources
   */
  async scrapeAllSources(): Promise<ScrapeResult> {
    this.logger.log('Starting scrape of all active sources...');

    const sources = await this.grantSourceRepo.find({
      where: { is_active: true },
    });

    let totalAdded = 0;
    let totalUpdated = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        const result = await this.scrapeSource(source.id);
        totalAdded += result.grants_added;
        totalUpdated += result.grants_updated;
      } catch (error) {
        const errorMsg = `${source.name}: ${error.message}`;
        errors.push(errorMsg);
        this.logger.error(errorMsg);
      }
    }

    this.logger.log(`Scraping complete. Added: ${totalAdded}, Updated: ${totalUpdated}, Errors: ${errors.length}`);

    return {
      sources_scraped: sources.length,
      grants_added: totalAdded,
      grants_updated: totalUpdated,
      errors,
    };
  }

  /**
   * Scrape a single grant source by ID
   */
  async scrapeSource(sourceId: number): Promise<{ grants_added: number; grants_updated: number }> {
    const startTime = Date.now();
    const source = await this.grantSourceRepo.findOne({ where: { id: sourceId } });

    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }

    this.logger.log(`Scraping source: ${source.name} (${source.url})`);

    try {
      // 1. Fetch content based on strategy
      const content = await this.fetchContent(source);

      if (!content || content.trim().length < 100) {
        this.logger.warn(`Insufficient content from ${source.name}`);
        await this.logScrape(source, 'no_data', 0, 0, 0, 'Insufficient content extracted', Date.now() - startTime);
        return { grants_added: 0, grants_updated: 0 };
      }

      // 2. Extract grant data using GPT-4
      const extractedGrants = await this.extractGrantData(content, source.url, source.chain_name);

      // 3. Save or update grants
      let grantsAdded = 0;
      let grantsUpdated = 0;

      for (const grantData of extractedGrants) {
        const isNew = await this.saveOrUpdateGrant(grantData, source.url);
        if (isNew) {
          grantsAdded++;
        } else {
          grantsUpdated++;
        }
      }

      // 4. Update source metadata
      await this.grantSourceRepo.update(source.id, {
        last_scraped_at: new Date(),
        last_success_at: new Date(),
        consecutive_failures: 0,
        last_error: null,
      });

      // 5. Log success
      await this.logScrape(source, 'success', extractedGrants.length, grantsAdded, grantsUpdated, null, Date.now() - startTime);

      this.logger.log(`✓ ${source.name}: Found ${extractedGrants.length} grants (${grantsAdded} new, ${grantsUpdated} updated)`);

      return { grants_added: grantsAdded, grants_updated: grantsUpdated };
    } catch (error) {
      // Update source with error
      await this.grantSourceRepo.update(source.id, {
        last_scraped_at: new Date(),
        consecutive_failures: source.consecutive_failures + 1,
        last_error: error.message,
      });

      // Log failure
      await this.logScrape(source, 'error', 0, 0, 0, error.message, Date.now() - startTime);

      throw error;
    }
  }

  /**
   * Fetch content based on scraping strategy
   */
  private async fetchContent(source: GrantSource): Promise<string> {
    switch (source.scrape_strategy) {
      case 'puppeteer':
        return this.fetchWithPuppeteer(source.url);

      case 'rss_feed':
        return this.fetchRSSFeed(source.url);

      case 'static_html':
      default:
        return this.fetchStaticHTML(source.url);
    }
  }

  /**
   * Strategy A: Static HTML scraping with Cheerio
   */
  private async fetchStaticHTML(url: string): Promise<string> {
    this.logger.debug(`Fetching static HTML from: ${url}`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove scripts, styles, nav, footer
      $('script, style, nav, footer, header').remove();

      // Extract main content (try common selectors)
      let content = '';
      const selectors = ['main', 'article', '.content', '#content', 'body'];

      for (const selector of selectors) {
        const text = $(selector).text().trim();
        if (text.length > 200) {
          content = text;
          break;
        }
      }

      if (!content) {
        content = $('body').text().trim();
      }

      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim();

      // Limit to first 15000 characters to avoid token limits
      return content.substring(0, 15000);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Fetch timeout after 15 seconds for ${url}`);
      }
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
  }

  /**
   * Strategy B: Dynamic content scraping with Puppeteer
   */
  private async fetchWithPuppeteer(url: string): Promise<string> {
    this.logger.debug(`Fetching with Puppeteer from: ${url}`);

    let browser;
    try {
      // Try to use system Chrome first, fallback to bundled Chromium
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract text content
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const unwanted = document.querySelectorAll('script, style, nav, footer, header');
        unwanted.forEach(el => el.remove());

        // Get main content
        const main = document.querySelector('main') ||
                     document.querySelector('article') ||
                     document.querySelector('.content') ||
                     document.body;

        return main?.innerText || '';
      });

      return content.substring(0, 15000);
    } catch (error) {
      this.logger.error(`Puppeteer error for ${url}: ${error.message}`);
      throw new Error(`Failed to fetch with Puppeteer: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Strategy C: RSS Feed parsing
   */
  private async fetchRSSFeed(url: string): Promise<string> {
    this.logger.debug(`Fetching RSS feed from: ${url}`);

    const response = await fetch(url);
    const xml = await response.text();

    const $ = cheerio.load(xml, { xmlMode: true });

    // Extract items with "grant" in title or description
    const items: string[] = [];

    $('item').each((_, item) => {
      const title = $(item).find('title').text();
      const description = $(item).find('description').text();
      const content = $(item).find('content\\:encoded').text() || description;

      if (title.toLowerCase().includes('grant') || description.toLowerCase().includes('grant')) {
        items.push(`Title: ${title}\n${content}`);
      }
    });

    return items.join('\n\n---\n\n').substring(0, 15000);
  }

  /**
   * Extract structured grant data using GPT-4
   */
  private async extractGrantData(content: string, sourceUrl: string, defaultChain: string): Promise<ExtractedGrant[]> {
    this.logger.debug(`Extracting grant data with GPT-4...`);

    const systemPrompt = `You are a grant data extractor for Web3/blockchain grants. Extract structured information from grant announcements and program pages.`;

    const userPrompt = `Analyze this grant page content and extract structured data. If this page contains MULTIPLE grants, extract each one separately.

CONTENT:
${content}

For EACH grant program mentioned, return a JSON object with these exact fields:
{
  "title": "official program name",
  "chain": "one of: BNB Chain, Solana, Ethereum, Polygon, Base, Arbitrum, Optimism, Near, Aptos, Sui, Scroll, or Multichain",
  "category": "one of: Infra, DeFi, Gaming, Consumer, Public Goods, Ecosystem, Tooling, ZK, L2 Infra, Hackathons",
  "tag": "short description like 'Infra · DeFi · Tooling' (max 3 items)",
  "amount": "funding amount like 'Up to $150k' or 'Varies' or '$5k - $50k'",
  "status": "Open, Upcoming, or Closed",
  "deadline": "specific date like 'Dec 30, 2025' or 'Rolling' or 'Q1 2026'",
  "summary": "2-3 sentences describing what the grant supports",
  "focus": "1-2 sentences on ideal applicant profile/requirements",
  "link": "${sourceUrl}",
  "fit_score": "OPTIONAL - short assessment like 'Strong for DeFi builders' or 'Good for early-stage teams' or 'Ideal for infrastructure projects'",
  "fit_description": "OPTIONAL - 1 sentence explaining who this grant is best suited for",
  "time_to_apply": "OPTIONAL - estimated time like '30-45 minutes' or '2-3 hours' or '1-2 weeks'",
  "time_to_apply_description": "OPTIONAL - 1 sentence about what's needed (e.g., 'Requires pitch deck and metrics' or 'Simple online form')"
}

IMPORTANT: The fit_score, fit_description, time_to_apply, and time_to_apply_description fields are OPTIONAL.
Only include them if you can make a reasonable estimate based on the grant requirements and application process described in the content.
If the information is not available, omit these fields from the JSON.

If multiple grants exist on this page, return an array of JSON objects: [grant1, grant2, ...]
If no grant information is found, return: { "error": "No grant data found" }

Return ONLY valid JSON. No markdown, no explanations.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const rawResponse = response.choices[0]?.message?.content || '';
      this.logger.debug(`GPT-4 response: ${rawResponse.substring(0, 200)}...`);

      // Parse JSON response
      let parsed;
      try {
        // Remove markdown code blocks if present
        const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        this.logger.error(`Failed to parse GPT-4 response as JSON: ${e.message}`);
        return [];
      }

      // Check for error response
      if (parsed.error) {
        this.logger.warn(`No grant data found in content from ${sourceUrl}`);
        return [];
      }

      // Handle both single object and array
      const grants = Array.isArray(parsed) ? parsed : [parsed];

      // Set default chain if not specified
      return grants.map(g => ({
        ...g,
        chain: g.chain || defaultChain,
      }));
    } catch (error) {
      this.logger.error(`GPT-4 extraction error: ${error.message}`);
      return [];
    }
  }

  /**
   * Save or update grant in database with deduplication
   */
  private async saveOrUpdateGrant(grantData: ExtractedGrant, sourceUrl: string): Promise<boolean> {
    // Check if grant exists (by title + chain)
    const existing = await this.grantRepo.findOne({
      where: {
        title: grantData.title,
        chain: grantData.chain,
      },
    });

    if (existing) {
      // Update if content has changed
      const hasChanges =
        existing.amount !== grantData.amount ||
        existing.status !== grantData.status ||
        existing.deadline !== grantData.deadline ||
        existing.summary !== grantData.summary;

      if (hasChanges) {
        await this.grantRepo.update(existing.id, {
          amount: grantData.amount,
          status: grantData.status as any,
          deadline: grantData.deadline,
          summary: grantData.summary,
          focus: grantData.focus,
          link: grantData.link || sourceUrl,
          tag: grantData.tag,
          category: grantData.category,
          source_url: sourceUrl,
          // Use extracted values, fallback to existing, then null
          fit_score: grantData.fit_score || existing.fit_score || null,
          fit_description: grantData.fit_description || existing.fit_description || null,
          time_to_apply: grantData.time_to_apply || existing.time_to_apply || null,
          time_to_apply_description: grantData.time_to_apply_description || existing.time_to_apply_description || null,
        });
        this.logger.debug(`Updated grant: ${grantData.title}`);
      }

      return false; // Not new
    } else {
      // Insert new grant
      const grantStatus = grantData.status === 'Open' ? GrantStatus.OPEN :
                          grantData.status === 'Upcoming' ? GrantStatus.UPCOMING :
                          GrantStatus.CLOSED;

      await this.grantRepo.save({
        title: grantData.title,
        chain: grantData.chain,
        category: grantData.category,
        tag: grantData.tag,
        amount: grantData.amount,
        status: grantStatus,
        deadline: grantData.deadline,
        summary: grantData.summary,
        focus: grantData.focus,
        link: grantData.link || sourceUrl,
        source_url: sourceUrl,
        // Use extracted values from GPT-4, or null if not provided
        fit_score: grantData.fit_score || null,
        fit_description: grantData.fit_description || null,
        time_to_apply: grantData.time_to_apply || null,
        time_to_apply_description: grantData.time_to_apply_description || null,
      });
      this.logger.debug(`Added new grant: ${grantData.title}`);

      return true; // New grant
    }
  }

  /**
   * Log scraping activity
   */
  private async logScrape(
    source: GrantSource,
    status: string,
    grantsFound: number,
    grantsAdded: number,
    grantsUpdated: number,
    errorMessage: string | null,
    durationMs: number,
  ): Promise<void> {
    await this.scraperLogRepo.save({
      source_id: source.id,
      source_name: source.name,
      status,
      grants_found: grantsFound,
      grants_added: grantsAdded,
      grants_updated: grantsUpdated,
      error_message: errorMessage,
      duration_ms: durationMs,
    });
  }

  /**
   * Get recent scraper logs
   */
  async getRecentLogs(limit: number = 100): Promise<ScraperLog[]> {
    return this.scraperLogRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get all grant sources
   */
  async getAllSources(): Promise<GrantSource[]> {
    return this.grantSourceRepo.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Deactivate stale grants (not seen in 14+ days)
   */
  async deactivateStaleGrants(): Promise<number> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const result = await this.grantRepo
      .createQueryBuilder()
      .update(Grant)
      .set({ status: GrantStatus.CLOSED as any })
      .where('status != :status', { status: GrantStatus.CLOSED })
      .andWhere('updated_at < :date', { date: twoWeeksAgo })
      .execute();

    this.logger.log(`Marked ${result.affected} stale grants as Closed`);
    return result.affected || 0;
  }
}
