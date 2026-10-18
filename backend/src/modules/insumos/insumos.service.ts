import type { Insumo, Movimentacao } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import type { AtualizarInsumo, CriarInsumo, FiltrosInsumos, Movimentar } from './insumos.schema.js';

/**
 * RN07 — status do insumo, calculado a partir do saldo e do estoque mínimo.
 * BAIXO: saldo ≤ mínimo · ATENCAO: saldo ≤ 1,5 × mínimo · NORMAL: acima disso.
 */
export function statusDoInsumo(quantidade: number, estoqueMinimo: number) {
  if (quantidade <= estoqueMinimo) return 'BAIXO' as const;
  if (quantidade <= estoqueMinimo * 1.5) return 'ATENCAO' as const;
  return 'NORMAL' as const;
}

/** Converte o Decimal do banco em número e acrescenta o status (RN07) e o valor em estoque. */
function paraResposta(insumo: Insumo) {
  const custoUnitario = Number(insumo.custoUnitario);
  return {
    ...insumo,
    custoUnitario,
    valorEmEstoque: Math.round(insumo.quantidade * custoUnitario * 100) / 100,
    status: statusDoInsumo(insumo.quantidade, insumo.estoqueMinimo),
  };
}

const movimentacaoParaResposta = (m: Movimentacao & { usuario: { nome: string } }) => ({
  ...m,
  custoUnitario: Number(m.custoUnitario),
});

export async function listar({ busca, categoria, status }: FiltrosInsumos) {
  const insumos = await prisma.insumo.findMany({
    where: { categoria, ...(busca && { nome: { contains: busca, mode: 'insensitive' } }) },
    orderBy: { nome: 'asc' },
  });
  const lista = insumos.map(paraResposta);
  return status ? lista.filter((i) => i.status === status) : lista;
}

/** Números dos cards da tela de Estoque. */
export async function resumo() {
  const insumos = (await prisma.insumo.findMany()).map(paraResposta);
  return {
    totalItens: insumos.length,
    abaixoMinimo: insumos.filter((i) => i.status === 'BAIXO').length,
    emAtencao: insumos.filter((i) => i.status === 'ATENCAO').length,
    valorEstimado: Math.round(insumos.reduce((soma, i) => soma + i.valorEmEstoque, 0) * 100) / 100,
  };
}

async function buscar(id: number) {
  const insumo = await prisma.insumo.findUnique({ where: { id } });
  if (!insumo) throw new AppError(404, 'INSUMO_NAO_ENCONTRADO', 'Insumo não encontrado');
  return insumo;
}

export async function buscarPorId(id: number) {
  return paraResposta(await buscar(id));
}

async function garantirNomeDisponivel(nome: string, ignorarId?: number) {
  const existente = await prisma.insumo.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' }, NOT: ignorarId ? { id: ignorarId } : undefined },
    select: { id: true },
  });
  if (existente) throw new AppError(409, 'INSUMO_DUPLICADO', `Já existe um insumo chamado "${nome}"`);
}

/** Cadastra o insumo com saldo zero; a quantidade inicial entra como movimentação (RN06). */
export async function criar({ quantidadeInicial, ...dados }: CriarInsumo, usuarioId: number) {
  await garantirNomeDisponivel(dados.nome);

  const insumo = await prisma.$transaction(async (tx) => {
    const novo = await tx.insumo.create({ data: { ...dados, quantidade: 0 } });
    if (!quantidadeInicial) return novo;
    await tx.movimentacao.create({
      data: { tipo: 'ENTRADA', quantidade: quantidadeInicial, custoUnitario: dados.custoUnitario, insumoId: novo.id, usuarioId },
    });
    return tx.insumo.update({ where: { id: novo.id }, data: { quantidade: quantidadeInicial } });
  });
  return paraResposta(insumo);
}

export async function atualizar(id: number, dados: AtualizarInsumo) {
  await buscar(id);
  if (dados.nome) await garantirNomeDisponivel(dados.nome, id);
  return paraResposta(await prisma.insumo.update({ where: { id }, data: dados }));
}

/**
 * RN06 — movimentação de estoque.
 * A movimentação e o novo saldo são gravados juntos numa transação: ou os dois
 * acontecem, ou nenhum. Saída maior que o saldo é recusada (422).
 */
export async function movimentar(id: number, { tipo, quantidade, custoUnitario, atividadeId }: Movimentar, usuarioId: number) {
  const insumo = await buscar(id);

  if (atividadeId) {
    const atividade = await prisma.atividade.findUnique({ where: { id: atividadeId }, select: { id: true } });
    if (!atividade) throw new AppError(422, 'ATIVIDADE_NAO_ENCONTRADA', 'A atividade informada não existe');
  }

  const custo = custoUnitario ?? Number(insumo.custoUnitario);

  const atualizado = await prisma.$transaction(async (tx) => {
    if (tipo === 'SAIDA') {
      // Baixa condicional: só debita se ainda houver saldo no momento da gravação.
      // Evita saldo negativo mesmo com duas saídas simultâneas.
      const { count } = await tx.insumo.updateMany({
        where: { id, quantidade: { gte: quantidade } },
        data: { quantidade: { decrement: quantidade } },
      });
      if (count === 0) {
        const atual = await tx.insumo.findUniqueOrThrow({ where: { id } });
        throw new AppError(
          422,
          'SALDO_INSUFICIENTE',
          `Saldo insuficiente de ${insumo.nome}: há ${atual.quantidade} ${insumo.unidade} e a saída pedida é de ${quantidade} ${insumo.unidade}`,
          { saldo: atual.quantidade, solicitado: quantidade },
        );
      }
    } else {
      // Entrada soma ao saldo e atualiza o custo unitário para o último preço pago.
      await tx.insumo.update({
        where: { id },
        data: { quantidade: { increment: quantidade }, custoUnitario: custo },
      });
    }

    await tx.movimentacao.create({
      data: { tipo, quantidade, custoUnitario: custo, insumoId: id, usuarioId, atividadeId },
    });

    return tx.insumo.findUniqueOrThrow({ where: { id } });
  });

  return paraResposta(atualizado);
}

/** Histórico de movimentações do insumo (mais recentes primeiro). */
export async function historico(id: number) {
  await buscar(id);
  const movimentacoes = await prisma.movimentacao.findMany({
    where: { insumoId: id },
    include: { usuario: { select: { nome: true } }, atividade: { select: { id: true, tipo: true } } },
    orderBy: { data: 'desc' },
    take: 50,
  });
  return movimentacoes.map(movimentacaoParaResposta);
}
