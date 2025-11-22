import { Controller, Get } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { Chain } from './entities/chain.entity';

@Controller('chains')
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Get()
  async findAll(): Promise<Chain[]> {
    return this.chainsService.findAll();
  }
}
