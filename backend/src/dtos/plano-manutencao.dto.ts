import z from "zod";

export const CriarPlanoManutencaoSchema = z.object({
    equipamentoId: z.number().int('ID do equipamento é obrigatório'),
    titulo: z.string().min(1, 'Título é obrigatório'),
    descricao: z.string().optional(),
    periodicidadeDias: z.number().int('Periodicidade em dias é obrigatória'),
    tecnicoId: z.number().int('ID do técnico é obrigatório'),
    dataProximaManutencao: z.string().optional(),
});

export const AtualizarPlanoManutencaoSchema = CriarPlanoManutencaoSchema.partial();

export type CriarPlanoManutencaoDTO = z.infer<typeof CriarPlanoManutencaoSchema>;
export type AtualizarPlanoManutencaoDTO = z.infer<typeof AtualizarPlanoManutencaoSchema>;