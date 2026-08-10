import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const cookieSameSiteValue = process.env.COOKIE_SAME_SITE ?? (nodeEnv === 'production' ? 'none' : 'strict');
if (cookieSameSiteValue !== 'strict' && cookieSameSiteValue !== 'none') throw new Error('COOKIE_SAME_SITE must be either strict or none');
const cookieSameSite: 'strict' | 'none' = cookieSameSiteValue;
const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : nodeEnv === 'production';
if (cookieSameSite === 'none' && !cookieSecure) throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none');

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  cookieSameSite,
  cookieSecure,
};
