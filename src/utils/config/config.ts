import * as Joi from 'joi';

export interface EnvironmentVariables {
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_SECRET: string;
  DATABASE_URL: string;
  DIRECT_URL: string;
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
}

export const configValidationSchema = Joi.object({
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  FRONTEND_URL: Joi.string().required(),
  RESEND_API_KEY: Joi.string().optional(),
});
