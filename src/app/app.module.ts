import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersController } from '@api/users/users.controller';
import { UsersModule } from '@api/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '@utils/auth/auth.controller';
import { AuthModule } from '@utils/auth/auth.module';
import { configValidationSchema } from '@utils/config/config';
import { FastifyDomainFilterMiddleware } from '@utils/middleware/domain-filter.middleware';
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FastifyDomainFilterMiddleware)
      .forRoutes(AuthController, UsersController);
  }
}
