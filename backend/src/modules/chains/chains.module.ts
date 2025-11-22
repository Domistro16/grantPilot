import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainsController } from './chains.controller';
import { ChainsService } from './chains.service';
import { Chain } from './entities/chain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  controllers: [ChainsController],
  providers: [ChainsService],
  exports: [ChainsService],
})
export class ChainsModule {}
