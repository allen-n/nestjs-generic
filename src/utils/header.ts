import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

export const SHOW_CONTROLLER_IN_SWAGGER =
  (process.env.NODE_ENV || 'development') !== 'development';

export const sJwtBearer = 'JWT-auth';
export const sApiKeyBearer = 'x-api-key';
/**
 * A swagger decorator for the WattShift JWT header.
 */
export const JwtHeader = ApiHeader({
  name: sJwtBearer,
  description: 'JWT',
});
/**
 * A swagger decorator for the WattShift API key header.
 */
export const ApiKeyHeader = ApiHeader({
  name: sApiKeyBearer,
  description: 'API Key',
});

/**
 * Indicates that the frontend JWT is required for this endpoint.
 */
export const JwtBearer = ApiBearerAuth(sJwtBearer);
