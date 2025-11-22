import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('scraper_logs')
export class ScraperLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  source_id: number;

  @Column({ type: 'varchar', length: 255 })
  source_name: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'success', 'error', 'no_data'

  @Column({ type: 'int', default: 0 })
  grants_found: number;

  @Column({ type: 'int', default: 0 })
  grants_added: number;

  @Column({ type: 'int', default: 0 })
  grants_updated: number;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'int', nullable: true })
  duration_ms: number;

  @CreateDateColumn()
  created_at: Date;
}
