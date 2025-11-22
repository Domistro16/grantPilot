import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrantsController } from './grants.controller';
import { GrantsService } from './grants.service';
import { Grant } from './entities/grant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grant])],
  controllers: [GrantsController],
  providers: [GrantsService],
  exports: [GrantsService],
})
export class GrantsModule {}
