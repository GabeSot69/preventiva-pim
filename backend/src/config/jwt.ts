import { env } from './env';

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXP = env.JWT_EXPIRES_IN;
export const REFRESH_EXP_DAYS = env.REFRESH_EXPIRES_DAYS;
