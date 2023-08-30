import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@utils/config/config';
import { Resend } from 'resend';
import {
  CreateEmailOptions,
  CreateEmailResponse,
} from 'resend/build/src/emails/interfaces';

@Injectable()
export class EmailService extends Resend {
  private logger = new Logger(EmailService.name);
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

  /**
   * Send an email
   * @param data
   * @returns
   */
  async sendEmail(data: CreateEmailOptions): Promise<CreateEmailResponse> {
    this.logger.log(`Sending email to ${data.to}`);
    return super.sendEmail(data);
  }
}
