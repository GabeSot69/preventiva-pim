import z from 'zod';

export const ItemChecklistExecucaoSchema = z.object({
  itemId: z.number().int('ID do item é obrigatório'),
  conforme: z.boolean(),
  observacao: z.string().optional(),
});

export const CriarExecucaoManutencaoSchema = z.object({
  planoId: z.number().int('ID do plano é obrigatório'),
  tecnicoId: z.number().int().optional(),
  dataExecucao: z.string().optional(),
  status: z.enum(['realizada', 'parcial', 'nao_realizada']),
  observacoes: z.string().optional(),
  conformidade: z.boolean(),
  checklist: z.array(ItemChecklistExecucaoSchema).optional(),
});

export const AtualizarExecucaoManutencaoSchema = CriarExecucaoManutencaoSchema.partial();

export type CriarExecucaoManutencaoDTO = z.infer<typeof CriarExecucaoManutencaoSchema>;
export type AtualizarExecucaoManutencaoDTO = z.infer<typeof AtualizarExecucaoManutencaoSchema>;
