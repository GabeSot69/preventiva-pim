import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
