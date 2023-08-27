import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from '@api/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@utils/auth/auth.module';
import { configValidationSchema } from '@utils/config/config';
import { PrismaService } from '@utils/prisma/prisma.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: configValidationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
