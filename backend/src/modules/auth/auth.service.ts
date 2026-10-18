import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { gerarToken } from '../../lib/token.js';
import type { LoginEntrada } from './auth.schema.js';

/** Campos do usuário que podem ir para o frontend (nunca a senha). */
const camposPublicos = { id: true, nome: true, email: true, cargo: true, perfil: true, ativo: true } as const;

/**
 * RN01 — Login.
 * E-mail ou senha errados → 401 (mesma mensagem, para não revelar quais e-mails existem).
 * Usuário inativo → 403.
 */
export async function login({ email, senha }: LoginEntrada) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;

  if (!usuario || !senhaConfere) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos');
  }
  if (!usuario.ativo) {
    throw new AppError(403, 'USUARIO_INATIVO', 'Usuário inativo. Procure o administrador');
  }

  const { senhaHash: _omitida, criadoEm: _c, atualizadoEm: _a, ...dadosPublicos } = usuario;
  return { token: gerarToken(usuario), usuario: dadosPublicos };
}

/** Dados do usuário dono do token. */
export async function buscarUsuarioLogado(id: number) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: camposPublicos });
  if (!usuario) throw new AppError(404, 'NAO_ENCONTRADO', 'Usuário não encontrado');
  return usuario;
}
