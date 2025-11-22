import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GrantStatus {
  OPEN = 'Open',
  UPCOMING = 'Upcoming',
  CLOSED = 'Closed',
}

@Entity('grants')
export class Grant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  chain: string;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  tag: string;

  @Column({ type: 'varchar', length: 255 })
  amount: string;

  @Column({
    type: 'enum',
    enum: GrantStatus,
    default: GrantStatus.OPEN,
  })
  status: GrantStatus;

  @Column({ type: 'varchar', length: 255 })
  deadline: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text' })
  focus: string;

  @Column({ type: 'text' })
  link: string;

  @Column({ type: 'text' })
  source_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
