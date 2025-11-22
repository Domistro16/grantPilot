import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-admin-api-key'];
    const configuredKey = this.configService.get<string>('adminApiKey');

    if (!apiKey || apiKey !== configuredKey) {
      throw new UnauthorizedException('Invalid or missing admin API key');
    }

    return true;
  }
}
