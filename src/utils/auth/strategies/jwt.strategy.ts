import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtPayload, validatedJwtUserInfo } from '../types';
import { EnvKeys } from '@utils/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(EnvKeys.JWT_ACCESS_SECRET),
    });
  }

  async validate(payload: jwtPayload): Promise<validatedJwtUserInfo> {
    return {
      userId: payload.sub,
      email: payload.username,
    } as validatedJwtUserInfo;
  }
}
