import { z } from 'zod';

export const PERFIS = ['ADMIN', 'TECNICO', 'LEITOR'] as const;

const campos = z.object({
  nome: z.string({ message: 'Informe o nome' }).trim().min(3, 'Nome muito curto (mín. 3 caracteres)').max(80, 'Nome muito longo'),
  email: z.string({ message: 'Informe o e-mail' }).trim().toLowerCase().email('Informe um e-mail válido'),
  cargo: z.string({ message: 'Informe o cargo' }).trim().min(2, 'Informe o cargo').max(60, 'Cargo muito longo'),
  perfil: z.enum(PERFIS, { message: 'Perfil inválido' }),
  // RN11 — senha com no mínimo 8 caracteres.
  senha: z.string({ message: 'Informe a senha' }).min(8, 'A senha deve ter no mínimo 8 caracteres').max(72, 'Senha muito longa'),
});

/** Corpo de POST /usuarios. */
export const criarUsuarioSchema = campos;

/** Corpo de PUT /usuarios/:id — senha opcional (só se for redefinir). */
export const atualizarUsuarioSchema = campos.partial().extend({
  senha: z.preprocess((v) => (v === '' ? undefined : v), campos.shape.senha.optional()),
});

/** Corpo de PATCH /usuarios/:id/status. */
export const alterarStatusSchema = z.object({ ativo: z.boolean({ message: 'Informe ativo: true ou false' }) });

export type CriarUsuario = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuario = z.infer<typeof atualizarUsuarioSchema>;
