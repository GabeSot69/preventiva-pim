import { z } from 'zod';

export const DadosEntradaSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type DadosEntrada = z.infer<typeof DadosEntradaSchema>;
