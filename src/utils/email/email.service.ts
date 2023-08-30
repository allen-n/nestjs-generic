import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@utils/config/config';
import { Resend } from 'resend';

/**
 * A wrapper around the Resend API client.
 * @see https://resend.com/docs/introduction
 */
@Injectable()
export class EmailService extends Resend {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const apiKey = configService.get('RESEND_API_KEY', { infer: true });
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not defined, but is required to use the EmailService.',
      );
    }
    super(apiKey);
  }
}
