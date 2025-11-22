import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
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

  @CreateDateColumn()
  created_at: Date;
}
