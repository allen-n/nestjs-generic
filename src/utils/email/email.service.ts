import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@utils/config/config';
import { Resend } from 'resend';

/**
 * A wrapper around the Resend API client.
 * @see https://resend.com/docs/introduction
 */
@Injectable()
export class EmailService extends Resend {
  private logger = new Logger(EmailService.name);
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const defaultKey = 'temp';
    const apiKey =
      configService.get('RESEND_API_KEY', { infer: true }) || defaultKey;

    super(apiKey);
    if (apiKey === defaultKey) {
      this.logger.error(
        'RESEND_API_KEY is set to the default value. Emails will not be sent.',
      );
    }
  }
}
