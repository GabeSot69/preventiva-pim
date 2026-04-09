import { z } from 'zod';

export const DadosTokenAtualizacaoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type DadosTokenAtualizacao = z.infer<typeof DadosTokenAtualizacaoSchema>;
