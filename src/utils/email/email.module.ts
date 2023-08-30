import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '@utils/email/email.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
