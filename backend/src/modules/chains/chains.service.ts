import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chain } from './entities/chain.entity';

@Injectable()
export class ChainsService {
  constructor(
    @InjectRepository(Chain)
    private chainsRepository: Repository<Chain>,
  ) {}

  async findAll(): Promise<Chain[]> {
    return this.chainsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async create(chainData: Partial<Chain>): Promise<Chain> {
    const chain = this.chainsRepository.create(chainData);
    return this.chainsRepository.save(chain);
  }
}
