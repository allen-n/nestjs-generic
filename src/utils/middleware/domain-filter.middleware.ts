import { EnvironmentVariables } from '@utils/config/config';
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

@Injectable()
export class FastifyDomainFilterMiddleware implements NestMiddleware {
  private readonly allowedDomains: string;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    // Add your allowed domains here
    this.allowedDomains = configService.get('FRONTEND_URL', { infer: true });
  }

  use(req: FastifyRequest, res: any, next: () => void) {
    const origin = req.headers.host;

    if (!this.allowedDomains.includes(origin)) {
      throw new ForbiddenException({
        message: `Cannot make requests to this route from the ${origin} domain`,
      });
    }

    next();
  }
}
