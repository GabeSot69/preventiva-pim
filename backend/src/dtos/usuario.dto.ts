import { z } from 'zod';

export const CriarUsuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  perfil: z.string().optional(),
  perfilId: z.number().optional(),
  setor: z.string().optional(),
});

export const AtualizarUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  perfil: z.string().optional(),
  perfilId: z.number().optional(),
  setor: z.string().optional(),
  ativo: z.boolean().optional(),
});

export const RegistroUsuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const TrocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export type CriarUsuarioDTO = z.infer<typeof CriarUsuarioSchema>;
export type AtualizarUsuarioDTO = z.infer<typeof AtualizarUsuarioSchema>;
export type RegistroUsuarioDTO = z.infer<typeof RegistroUsuarioSchema>;
export type TrocarSenhaDTO = z.infer<typeof TrocarSenhaSchema>;
