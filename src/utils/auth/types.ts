import { Request } from '@nestjs/common';
import { ApiKey, User } from '@prisma/client';

export type jwtPayload = {
  username: string;
  sub: string;
};

export type validatedJwtUserInfo = {
  userId: string;
  email: string;
  refreshToken?: string;
};

export interface JwtAuthenticatedRequest extends Request {
  user: validatedJwtUserInfo;
}

export interface PasswordAuthenticatedRequest extends Request {
  user: User;
}

export interface AuthenticatedRequest extends Request {
  apiKey: ApiKey;
}
