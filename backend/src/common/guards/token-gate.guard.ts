import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenGateService } from '../services/token-gate.service';

@Injectable()
export class TokenGateGuard implements CanActivate {
  constructor(private tokenGateService: TokenGateService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const walletAddress = request.body?.wallet_address;

    // Check if wallet address is provided
    if (!walletAddress) {
      throw new UnauthorizedException(
        'Wallet address is required to access the AI Agent',
      );
    }

    // Verify token balance
    const verification =
      await this.tokenGateService.verifyTokenBalance(walletAddress);

    if (verification.error) {
      throw new ForbiddenException(
        `Token verification failed: ${verification.error}`,
      );
    }

    if (!verification.hasAccess) {
      const tokenInfo = this.tokenGateService.getTokenGateInfo();
      throw new ForbiddenException(
        `Insufficient ${tokenInfo.tokenName} balance. Required: ${tokenInfo.requiredAmount}, Current: ${verification.balance}`,
      );
    }

    return true;
  }
}
