import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grant } from '../../grants/entities/grant.entity';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  user_email: string;

  @Column({ type: 'int' })
  grant_id: number;

  @ManyToOne(() => Grant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grant_id' })
  grant: Grant;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  unsubscribe_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_notified_at: Date | null;

  @Column({ type: 'boolean', default: false })
  seven_day_reminder_sent: boolean;

  @Column({ type: 'boolean', default: false })
  one_day_reminder_sent: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
