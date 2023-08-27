import { UsersModule } from '@api/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { BcryptService } from '@utils/auth/bcrypt';
import { RefreshTokenStrategy } from '@utils/auth/strategies/refreshToken.strategy';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiKeyService } from '@utils/api-key/api-key.service';
import { EnvironmentVariables } from '@utils/config/config';
import { PrismaService } from '@utils/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  providers: [
    AuthService,
    BcryptService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    PrismaService,
    ApiKeyService,
  ],
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => ({
        secret: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { expiresIn: '15m', algorithm: 'HS384' },
        verifyOptions: {
          algorithms: ['HS384'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, ApiKeyService],
})
export class AuthModule {}
