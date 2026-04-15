import z from "zod";

export const CriarEquipamentoSchema = z.object({
    codigo: z.string().min(1, 'Código é obrigatório'),
    nome: z.string().min(1, 'Nome é obrigatório'),
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    localizacao: z.string().min(1, 'Localização é obrigatória'),
    fabricante: z.string().optional(),
    modelo: z.string().optional(),
});

export const AtualizarEquipamentoSchema = CriarEquipamentoSchema.partial();

export type CriarEquipamentoDTO = z.infer<typeof CriarEquipamentoSchema>;
export type AtualizarEquipamentoDTO = z.infer<typeof AtualizarEquipamentoSchema>;