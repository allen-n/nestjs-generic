import { UsersModule } from '@api/users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { BcryptService } from '@utils/auth/bcrypt';
import { RefreshTokenStrategy } from '@utils/auth/strategies/refreshToken.strategy';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvKeys } from '@utils/env';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaService } from '@utils/prisma/prisma.service';

@Module({
  providers: [
    AuthService,
    BcryptService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    PrismaService,
  ],
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow(EnvKeys.JWT_ACCESS_SECRET),
        signOptions: { expiresIn: '15m', algorithm: 'HS384' },
        verifyOptions: {
          algorithms: ['HS384'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
