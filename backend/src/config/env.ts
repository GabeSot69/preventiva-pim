import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.preprocess((val) => val ?? '3000', z.string().transform(Number)),
  
  DB_TYPE: z.enum(['postgres', 'sqlite', 'mysql']).default('postgres'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.preprocess((val) => val ?? '5432', z.string().transform(Number)),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('preventiva_db'),
  TYPEORM_LOGGING: z.preprocess((val) => val === 'true', z.boolean()).default(false),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres para ser seguro').catch((_ctx) => {
    if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET inseguro ou ausente em produção');
    return 'chave_secreta_padrao_para_desenvolvimento_apenas';
  }),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_EXPIRES_DAYS: z.preprocess((val) => val ?? '7', z.string().transform(Number)),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
