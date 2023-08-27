import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { jwtPayload, validatedJwtUserInfo } from '@utils/auth/types';
import { EnvironmentVariables } from '@utils/config/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });
  }

  async validate(payload: jwtPayload): Promise<validatedJwtUserInfo> {
    return {
      userId: payload.sub,
      email: payload.username,
    } as validatedJwtUserInfo;
  }
}
