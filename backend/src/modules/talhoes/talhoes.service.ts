import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import type { AtualizarTalhao, CriarTalhao, FiltrosTalhoes } from './talhoes.schema.js';

/** Inclui a contagem de atividades (usada pelo frontend para saber se pode excluir). */
const comContagem = { _count: { select: { atividades: true } } } as const;

export async function listar({ busca, status }: FiltrosTalhoes) {
  return prisma.talhao.findMany({
    where: {
      status,
      // Busca por nome OU cultura, sem diferenciar maiúsculas de minúsculas.
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { cultura: { contains: busca, mode: 'insensitive' } },
        ],
      }),
    },
    include: comContagem,
    orderBy: { nome: 'asc' },
  });
}

export async function buscarPorId(id: number) {
  const talhao = await prisma.talhao.findUnique({ where: { id }, include: comContagem });
  if (!talhao) throw new AppError(404, 'TALHAO_NAO_ENCONTRADO', 'Talhão não encontrado');
  return talhao;
}

/** RN03 — o nome do talhão é único na fazenda. */
async function garantirNomeDisponivel(nome: string, ignorarId?: number) {
  const existente = await prisma.talhao.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' }, NOT: ignorarId ? { id: ignorarId } : undefined },
    select: { id: true },
  });
  if (existente) throw new AppError(409, 'TALHAO_DUPLICADO', `Já existe um talhão chamado "${nome}"`);
}

export async function criar(dados: CriarTalhao) {
  await garantirNomeDisponivel(dados.nome);
  return prisma.talhao.create({ data: dados, include: comContagem });
}

export async function atualizar(id: number, dados: AtualizarTalhao) {
  await buscarPorId(id);
  if (dados.nome) await garantirNomeDisponivel(dados.nome, id);
  return prisma.talhao.update({ where: { id }, data: dados, include: comContagem });
}

/** RN03 — talhão com atividades registradas não pode ser excluído (preserva o histórico). */
export async function excluir(id: number) {
  const talhao = await buscarPorId(id);
  if (talhao._count.atividades > 0) {
    throw new AppError(
      409,
      'TALHAO_COM_ATIVIDADES',
      `Não é possível excluir "${talhao.nome}": há ${talhao._count.atividades} atividade(s) registrada(s) nele`,
    );
  }
  await prisma.talhao.delete({ where: { id } });
}
