import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import type { AtualizarUsuario, CriarUsuario } from './usuarios.schema.js';

/** Campos que podem sair da API (nunca o hash da senha). */
const publicos = { id: true, nome: true, email: true, cargo: true, perfil: true, ativo: true, criadoEm: true } as const;

export async function listar() {
  return prisma.usuario.findMany({ select: publicos, orderBy: [{ ativo: 'desc' }, { nome: 'asc' }] });
}

/** Usuários ativos, para os campos "Responsável" das telas. */
export async function responsaveis() {
  return prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, nome: true, cargo: true }, orderBy: { nome: 'asc' } });
}

async function buscar(id: number) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado');
  return usuario;
}

/** RN11 — e-mail único (sem diferenciar maiúsculas). */
async function garantirEmailDisponivel(email: string, ignorarId?: number) {
  const existente = await prisma.usuario.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, NOT: ignorarId ? { id: ignorarId } : undefined },
    select: { id: true },
  });
  if (existente) throw new AppError(409, 'EMAIL_DUPLICADO', `O e-mail ${email} já está cadastrado`);
}

/** RN11 — o sistema nunca pode ficar sem ao menos um administrador ativo. */
async function garantirOutroAdminAtivo(id: number) {
  const outros = await prisma.usuario.count({ where: { perfil: 'ADMIN', ativo: true, NOT: { id } } });
  if (outros === 0) {
    throw new AppError(422, 'ULTIMO_ADMIN', 'Este é o único administrador ativo. Cadastre ou ative outro administrador antes.');
  }
}

export async function criar({ senha, ...dados }: CriarUsuario) {
  await garantirEmailDisponivel(dados.email);
  return prisma.usuario.create({
    data: { ...dados, senhaHash: await bcrypt.hash(senha, 10) },
    select: publicos,
  });
}

export async function atualizar(id: number, { senha, ...dados }: AtualizarUsuario, adminId: number) {
  const atual = await buscar(id);
  if (dados.email) await garantirEmailDisponivel(dados.email, id);

  const deixaDeSerAdmin = atual.perfil === 'ADMIN' && dados.perfil && dados.perfil !== 'ADMIN';
  if (deixaDeSerAdmin) {
    // RN11 — o administrador não pode tirar o próprio perfil (perderia o acesso a esta tela).
    if (id === adminId) throw new AppError(422, 'AUTO_REBAIXAMENTO', 'Você não pode remover o seu próprio perfil de administrador');
    if (atual.ativo) await garantirOutroAdminAtivo(id);
  }

  return prisma.usuario.update({
    where: { id },
    data: { ...dados, ...(senha && { senhaHash: await bcrypt.hash(senha, 10) }) },
    select: publicos,
  });
}

/**
 * RN11 — ativar/desativar.
 * O administrador não pode desativar a própria conta, nem o último administrador ativo.
 * Um usuário desativado perde o acesso na próxima requisição (o middleware autenticar confere o banco).
 */
export async function alterarStatus(id: number, ativo: boolean, adminId: number) {
  const atual = await buscar(id);
  if (!ativo) {
    if (id === adminId) throw new AppError(422, 'AUTO_DESATIVACAO', 'Você não pode desativar a sua própria conta');
    if (atual.perfil === 'ADMIN') await garantirOutroAdminAtivo(id);
  }
  return prisma.usuario.update({ where: { id }, data: { ativo }, select: publicos });
}
