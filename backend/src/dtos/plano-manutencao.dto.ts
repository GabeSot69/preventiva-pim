import z from "zod";

export const CriarPlanoManutencaoSchema = z.object({
    equipamentoId: z.number().int('ID do equipamento é obrigatório'),
    titulo: z.string().min(1, 'Título é obrigatório'),
    descricao: z.string().optional(),
    periodicidadeDias: z.number().int('Periodicidade em dias é obrigatória'),
    tecnicoId: z.number().int().optional(),
    dataProximaManutencao: z.string().datetime({ message: 'Data deve ser uma data ISO válida' }).optional(),
    itensChecklist: z.array(z.object({
        descricao: z.string().min(1, 'Descrição do item é obrigatória'),
        ordem: z.number().int().optional(),
    })).optional(),
});

export const AtualizarPlanoManutencaoSchema = CriarPlanoManutencaoSchema.partial().extend({
    ativo: z.boolean().optional(),
});

export type CriarPlanoManutencaoDTO = z.infer<typeof CriarPlanoManutencaoSchema>;
export type AtualizarPlanoManutencaoDTO = z.infer<typeof AtualizarPlanoManutencaoSchema>;
