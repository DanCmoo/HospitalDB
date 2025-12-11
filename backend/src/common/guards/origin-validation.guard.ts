import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OriginValidationGuard implements CanActivate {
  private readonly logger = new Logger(OriginValidationGuard.name);
  private readonly allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
    'http://localhost:3000',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin || request.headers.referer;

    // Si no hay origen (requests directos del servidor), permitir
    if (!origin) {
      return true;
    }

    const isAllowed = this.allowedOrigins.some((allowedOrigin) =>
      origin.startsWith(allowedOrigin),
    );

    if (!isAllowed) {
      this.logger.warn(`Blocked request from unauthorized origin: ${origin}`);
      throw new ForbiddenException('Origin not allowed');
    }

    return true;
  }
}
