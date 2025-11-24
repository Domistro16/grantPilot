import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { GrantsModule } from '../grants/grants.module';
import { TokenGateService } from '../../common/services/token-gate.service';

@Module({
  imports: [GrantsModule],
  controllers: [AgentController],
  providers: [AgentService, TokenGateService],
  exports: [AgentService],
})
export class AgentModule {}
