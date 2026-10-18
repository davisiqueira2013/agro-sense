import type { Perfil } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import type { AtualizarRegistro, CriarRegistro, FiltrosRegistros } from './diario.schema.js';

type UsuarioLogado = { id: number; perfil: Perfil };

const relacoes = {
  autor: { select: { id: true, nome: true } },
  talhao: { select: { id: true, nome: true } },
} as const;

export async function listar({ busca, categoria, talhaoId }: FiltrosRegistros) {
  return prisma.registroDiario.findMany({
    where: {
      categoria,
      talhaoId,
      ...(busca && {
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' } },
          { texto: { contains: busca, mode: 'insensitive' } },
        ],
      }),
    },
    include: relacoes,
    orderBy: [{ data: 'desc' }, { id: 'desc' }],
  });
}

async function garantirTalhao(talhaoId: number | null | undefined) {
  if (!talhaoId) return;
  const talhao = await prisma.talhao.findUnique({ where: { id: talhaoId }, select: { id: true } });
  if (!talhao) throw new AppError(422, 'TALHAO_NAO_ENCONTRADO', 'O talhão selecionado não existe');
}

/** RN10 — o autor é sempre o usuário autenticado (nunca um campo do formulário). */
export async function criar(dados: CriarRegistro, autorId: number) {
  await garantirTalhao(dados.talhaoId);
  return prisma.registroDiario.create({
    data: { ...dados, data: dados.data ?? new Date(), autorId },
    include: relacoes,
  });
}

/** RN10 — só o autor do registro ou um ADMIN pode alterá-lo ou excluí-lo. */
async function buscarComPermissao(id: number, usuario: UsuarioLogado) {
  const registro = await prisma.registroDiario.findUnique({ where: { id } });
  if (!registro) throw new AppError(404, 'REGISTRO_NAO_ENCONTRADO', 'Registro não encontrado');
  if (registro.autorId !== usuario.id && usuario.perfil !== 'ADMIN') {
    throw new AppError(403, 'SEM_PERMISSAO_REGISTRO', 'Somente o autor do registro ou um administrador pode alterá-lo');
  }
  return registro;
}

export async function atualizar(id: number, dados: AtualizarRegistro, usuario: UsuarioLogado) {
  await buscarComPermissao(id, usuario);
  await garantirTalhao(dados.talhaoId);
  return prisma.registroDiario.update({ where: { id }, data: dados, include: relacoes });
}

export async function excluir(id: number, usuario: UsuarioLogado) {
  await buscarComPermissao(id, usuario);
  await prisma.registroDiario.delete({ where: { id } });
}
