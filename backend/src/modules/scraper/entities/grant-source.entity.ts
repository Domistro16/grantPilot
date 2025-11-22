import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ScrapeStrategy {
  STATIC_HTML = 'static_html',
  PUPPETEER = 'puppeteer',
  RSS_FEED = 'rss_feed',
}

@Entity('grant_sources')
export class GrantSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 100 })
  chain_name: string;

  @Column({ type: 'varchar', length: 50, default: 'static_html' })
  scrape_strategy: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_scraped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_success_at: Date;

  @Column({ type: 'int', default: 0 })
  consecutive_failures: number;

  @Column({ type: 'text', nullable: true })
  last_error: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
