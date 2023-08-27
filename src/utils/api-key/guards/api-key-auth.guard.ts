import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ApiKeyService } from '@utils/api-key/api-key.service';
import { AuthenticatedRequest } from '@utils/auth/types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  private readonly logger = new Logger(ApiKeyGuard.name);
  private sApiKeyBearer = 'x-api-key';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthenticatedRequest = context.switchToHttp().getRequest();
    const key: string = req.headers[this.sApiKeyBearer];
    const reqInfoString = `${req.method}, url: ${req.url}`;
    if (!key) {
      this.logger.warn(`No API key provided. ${reqInfoString}`);
      throw new HttpException('No API key provided', HttpStatus.UNAUTHORIZED);
    }
    const keyObject = await this.apiKeyService.getKeyWithMetadata(key);
    if (!keyObject) {
      this.logger.warn(
        'Invalid API key provided: ' + key + '. ' + reqInfoString,
      );
      throw new HttpException(
        'Invalid API key provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    req.apiKey = keyObject;

    // Remove sensitive values from the request object
    delete req.apiKey.key;

    // TODO @allen: figure out best way to track these api requests (maybe in a table somewhere?)
    this.logger.log(
      `Valid API Request. method: ${req.method}, url: ${req.url}, user-id: ${req.apiKey.userId}, org-id: ${req.apiKey.organizationId}, key-id: ${req.apiKey.id}, key-name: ${req.apiKey.name}`,
    );
    return true;
  }
}
