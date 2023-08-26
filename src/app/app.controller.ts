import { Controller, Get, Headers, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name);

  @Get('/health')
  getHealth(@Headers() headers?): string {
    this.logger.log(
      `Health check from host: ${headers?.host ?? 'null'}. Referrer: ${
        headers?.referer ?? 'null'
      }`,
    );
    return 'OK';
  }
}
