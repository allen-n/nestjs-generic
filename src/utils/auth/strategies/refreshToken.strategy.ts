import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtPayload, validatedJwtUserInfo } from '@utils/auth/types';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from '@utils/env';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(EnvKeys.JWT_REFRESH_SECRET),
    });
  }

  async validate(payload: jwtPayload): Promise<validatedJwtUserInfo> {
    return {
      userId: payload.sub,
      email: payload.username,
    } as validatedJwtUserInfo;
  }
}
