import { Request } from '@nestjs/common';
import { ApiKey } from '@prisma/client';

export type jwtPayload = {
  username: string;
  sub: string;
};

export type validatedJwtUserInfo = {
  userId: string;
  email: string;
  refreshToken?: string;
};

export interface AuthenticatedPrivateRequest extends Request {
  user: validatedJwtUserInfo;
}

export interface AuthenticatedRequest extends Request {
  apiKey: ApiKey;
}
