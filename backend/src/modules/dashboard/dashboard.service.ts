import { prisma } from '../../lib/prisma.js';
import { limitesDoDia } from '../../lib/validacao.js';
import { statusDoInsumo } from '../insumos/insumos.service.js';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_EXTENSO = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const ORDEM_SEVERIDADE = { CRITICO: 0, ATENCAO: 1, AVISO: 2 } as const;

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

/** Alertas ativos agora: marcados como ativos e ainda não encerrados. */
export const filtroAlertaAtivo = (agora = new Date()) => ({ ativo: true, OR: [{ fim: null }, { fim: { gt: agora } }] });

/**
 * RN08 — indicadores do Dashboard, calculados no backend a partir dos dados reais.
 * - Talhões: total e ativos.
 * - Alertas ativos por severidade.
 * - Gasto do mês: soma das ENTRADAS de estoque (quantidade × custo) no mês corrente.
 * - Insumos críticos: abaixo do mínimo (RN07).
 * - Atividades atrasadas e previstas para hoje (RN04).
 */
export async function resumo() {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const { inicio: inicioHoje, fim: fimHoje } = limitesDoDia(agora);

  const [talhoesTotal, talhoesAtivos, alertas, entradasMes, insumos, atrasadas, hoje] = await Promise.all([
    prisma.talhao.count(),
    prisma.talhao.count({ where: { status: 'ATIVO' } }),
    prisma.alertaClimatico.findMany({
      where: filtroAlertaAtivo(agora),
      include: { talhoes: { select: { nome: true }, orderBy: { nome: 'asc' } } },
    }),
    prisma.movimentacao.findMany({
      where: { tipo: 'ENTRADA', data: { gte: inicioMes, lte: agora } },
      select: { quantidade: true, custoUnitario: true },
    }),
    prisma.insumo.findMany({ select: { quantidade: true, estoqueMinimo: true } }),
    prisma.atividade.count({ where: { status: { not: 'CONCLUIDA' }, dataPrevista: { lt: inicioHoje } } }),
    prisma.atividade.count({ where: { status: { not: 'CONCLUIDA' }, dataPrevista: { gte: inicioHoje, lte: fimHoje } } }),
  ]);

  const totalTalhoes = talhoesTotal;
  const porSeveridade = { CRITICO: 0, ATENCAO: 0, AVISO: 0 };
  for (const alerta of alertas) porSeveridade[alerta.severidade] += 1;

  const statusInsumos = insumos.map((i) => statusDoInsumo(i.quantidade, i.estoqueMinimo));

  return {
    data: agora.toISOString(),
    talhoes: { total: totalTalhoes, ativos: talhoesAtivos },
    alertas: { ativos: alertas.length, porSeveridade },
    gastoMes: {
      valor: arredondar(entradasMes.reduce((soma, m) => soma + m.quantidade * Number(m.custoUnitario), 0)),
      referencia: `${MESES_EXTENSO[agora.getMonth()]}/${agora.getFullYear()}`,
    },
    insumos: {
      criticos: statusInsumos.filter((s) => s === 'BAIXO').length,
      emAtencao: statusInsumos.filter((s) => s === 'ATENCAO').length,
    },
    atividades: { atrasadas, hoje },
    // Os 3 alertas mais graves, para o quadro "Alertas Rápidos".
    alertasRapidos: alertas
      .sort((a, b) => ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade])
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        titulo: a.titulo,
        severidade: a.severidade,
        talhoes: a.talhoes.map((t) => t.nome),
        todaFazenda: totalTalhoes > 0 && a.talhoes.length === totalTalhoes,
      })),
  };
}

/**
 * RN08 — custos por mês e por categoria de insumo (gráfico do Dashboard).
 * Custo = soma das ENTRADAS (quantidade × custo unitário) de cada mês.
 */
export async function custos(meses: number) {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - (meses - 1), 1);

  const entradas = await prisma.movimentacao.findMany({
    where: { tipo: 'ENTRADA', data: { gte: inicio, lte: agora } },
    select: { quantidade: true, custoUnitario: true, data: true, insumo: { select: { categoria: true } } },
  });

  // Um item por mês, mesmo que sem compras, para o eixo do gráfico ficar contínuo.
  const serie = Array.from({ length: meses }, (_, i) => {
    const mes = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
    return {
      mes: `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`,
      rotulo: MESES[mes.getMonth()],
      SEMENTES: 0,
      FERTILIZANTES: 0,
      DEFENSIVOS: 0,
      COMBUSTIVEL: 0,
      total: 0,
    };
  });

  for (const e of entradas) {
    const chave = `${e.data.getFullYear()}-${String(e.data.getMonth() + 1).padStart(2, '0')}`;
    const item = serie.find((s) => s.mes === chave);
    if (!item) continue;
    const valor = e.quantidade * Number(e.custoUnitario);
    item[e.insumo.categoria] += valor;
    item.total += valor;
  }

  return serie.map((s) => ({
    ...s,
    SEMENTES: arredondar(s.SEMENTES),
    FERTILIZANTES: arredondar(s.FERTILIZANTES),
    DEFENSIVOS: arredondar(s.DEFENSIVOS),
    COMBUSTIVEL: arredondar(s.COMBUSTIVEL),
    total: arredondar(s.total),
  }));
}
