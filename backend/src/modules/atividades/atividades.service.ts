import type { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { limitesDoDia } from '../../lib/validacao.js';
import type { AtualizarAtividade, CriarAtividade, FiltrosAtividades } from './atividades.schema.js';

const relacoes = {
  talhao: { select: { id: true, nome: true } },
  responsavel: { select: { id: true, nome: true } },
} as const;

type AtividadeComRelacoes = Prisma.AtividadeGetPayload<{ include: typeof relacoes }>;

/** Início do dia de hoje (horário do servidor). */
const inicioDeHoje = () => limitesDoDia(new Date()).inicio;

/**
 * RN04 — situação exibida. "ATRASADA" não é gravada: é calculada a cada consulta
 * para toda atividade não concluída cuja data prevista já passou.
 */
function comSituacao(atividade: AtividadeComRelacoes) {
  const atrasada = atividade.status !== 'CONCLUIDA' && atividade.dataPrevista < inicioDeHoje();
  return { ...atividade, situacao: atrasada ? ('ATRASADA' as const) : atividade.status };
}

/** Ordem da lista: atrasadas, em andamento, agendadas e, por fim, concluídas. */
const PRIORIDADE = { ATRASADA: 0, EM_ANDAMENTO: 1, AGENDADA: 2, CONCLUIDA: 3 } as const;

export async function listar({ situacao, tipo, talhaoId }: FiltrosAtividades) {
  const hoje = inicioDeHoje();
  const where: Prisma.AtividadeWhereInput = { tipo, talhaoId };

  if (situacao === 'ATRASADA') {
    Object.assign(where, { status: { not: 'CONCLUIDA' }, dataPrevista: { lt: hoje } });
  } else if (situacao === 'CONCLUIDA') {
    where.status = 'CONCLUIDA';
  } else if (situacao) {
    // Agendada / em andamento "no prazo" (as atrasadas têm filtro próprio).
    Object.assign(where, { status: situacao, dataPrevista: { gte: hoje } });
  }

  const atividades = await prisma.atividade.findMany({ where, include: relacoes, orderBy: { dataPrevista: 'asc' } });

  return atividades
    .map(comSituacao)
    .sort((a, b) => {
      const ordem = PRIORIDADE[a.situacao] - PRIORIDADE[b.situacao];
      if (ordem !== 0) return ordem;
      // Concluídas: as mais recentes primeiro; demais: as mais próximas primeiro.
      const diferenca = a.dataPrevista.getTime() - b.dataPrevista.getTime();
      return a.situacao === 'CONCLUIDA' ? -diferenca : diferenca;
    });
}

async function buscar(id: number) {
  const atividade = await prisma.atividade.findUnique({ where: { id }, include: relacoes });
  if (!atividade) throw new AppError(404, 'ATIVIDADE_NAO_ENCONTRADA', 'Atividade não encontrada');
  return atividade;
}

export async function buscarPorId(id: number) {
  return comSituacao(await buscar(id));
}

/** Talhão precisa existir; responsável precisa existir e estar ativo. */
async function validarVinculos(talhaoId?: number, responsavelId?: number) {
  if (talhaoId !== undefined) {
    const talhao = await prisma.talhao.findUnique({ where: { id: talhaoId }, select: { id: true } });
    if (!talhao) throw new AppError(422, 'TALHAO_NAO_ENCONTRADO', 'O talhão selecionado não existe');
  }
  if (responsavelId !== undefined) {
    const responsavel = await prisma.usuario.findUnique({ where: { id: responsavelId }, select: { ativo: true, nome: true } });
    if (!responsavel) throw new AppError(422, 'RESPONSAVEL_NAO_ENCONTRADO', 'O responsável selecionado não existe');
    if (!responsavel.ativo) {
      throw new AppError(422, 'RESPONSAVEL_INATIVO', `${responsavel.nome} está inativo e não pode receber atividades`);
    }
  }
}

/**
 * RN05 — Pulverização x vento.
 * Não é permitido agendar nem iniciar pulverização em talhão com alerta ativo
 * de vento forte que cubra o dia da operação (deriva do produto).
 */
async function garantirSemVentoForte(talhaoId: number, dia: Date) {
  const { inicio, fim } = limitesDoDia(dia);
  const alerta = await prisma.alertaClimatico.findFirst({
    where: {
      tipo: 'VENTO_FORTE',
      ativo: true,
      talhoes: { some: { id: talhaoId } },
      inicio: { lte: fim },
      OR: [{ fim: null }, { fim: { gt: inicio } }],
    },
    include: { talhoes: { where: { id: talhaoId }, select: { nome: true } } },
  });
  if (alerta) {
    const talhao = alerta.talhoes[0]?.nome ?? 'o talhão';
    throw new AppError(
      409,
      'PULVERIZACAO_BLOQUEADA_VENTO',
      `Pulverização bloqueada: há alerta de vento forte ativo para ${talhao} nesta data. Escolha outra data.`,
      { alertaId: alerta.id },
    );
  }
}

export async function criar(dados: CriarAtividade) {
  await validarVinculos(dados.talhaoId, dados.responsavelId);
  if (dados.tipo === 'PULVERIZACAO') await garantirSemVentoForte(dados.talhaoId, dados.dataPrevista);

  const atividade = await prisma.atividade.create({ data: dados, include: relacoes });
  return comSituacao(atividade);
}

export async function atualizar(id: number, dados: AtualizarAtividade) {
  const atual = await buscar(id);
  if (atual.status === 'CONCLUIDA') {
    throw new AppError(422, 'ATIVIDADE_CONCLUIDA', 'Atividade concluída não pode ser alterada');
  }
  await validarVinculos(dados.talhaoId, dados.responsavelId);

  // RN05 vale também na edição: confere o resultado final (tipo, talhão e data).
  const tipo = dados.tipo ?? atual.tipo;
  if (tipo === 'PULVERIZACAO') {
    await garantirSemVentoForte(dados.talhaoId ?? atual.talhaoId, dados.dataPrevista ?? atual.dataPrevista);
  }

  const atividade = await prisma.atividade.update({ where: { id }, data: dados, include: relacoes });
  return comSituacao(atividade);
}

/** RN04 — iniciar (AGENDADA → EM_ANDAMENTO) ou concluir (→ CONCLUIDA, grava a data de conclusão). */
export async function alterarStatus(id: number, novoStatus: 'EM_ANDAMENTO' | 'CONCLUIDA') {
  const atual = await buscar(id);

  if (atual.status === 'CONCLUIDA') {
    throw new AppError(422, 'ATIVIDADE_CONCLUIDA', 'Esta atividade já foi concluída');
  }
  if (novoStatus === 'EM_ANDAMENTO' && atual.status === 'EM_ANDAMENTO') {
    throw new AppError(422, 'TRANSICAO_INVALIDA', 'Esta atividade já está em andamento');
  }
  // RN05 — iniciar pulverização confere o vento de hoje.
  if (novoStatus === 'EM_ANDAMENTO' && atual.tipo === 'PULVERIZACAO') {
    await garantirSemVentoForte(atual.talhaoId, new Date());
  }

  const atividade = await prisma.atividade.update({
    where: { id },
    data: { status: novoStatus, dataConclusao: novoStatus === 'CONCLUIDA' ? new Date() : null },
    include: relacoes,
  });
  return comSituacao(atividade);
}

export async function excluir(id: number) {
  await buscar(id);
  await prisma.atividade.delete({ where: { id } });
}
