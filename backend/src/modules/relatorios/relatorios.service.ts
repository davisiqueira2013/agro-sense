import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { limitesDoDia } from '../../lib/validacao.js';
import { statusDoInsumo } from '../insumos/insumos.service.js';
import { montarPdf, type ConteudoRelatorio } from './relatorios.pdf.js';
import type { GerarRelatorio } from './relatorios.schema.js';

/** Período máximo de um relatório, em dias. */
export const PERIODO_MAXIMO_DIAS = 366;

const NOMES_TIPO = { CUSTOS: 'Custos', ATIVIDADES: 'Atividades', ESTOQUE: 'Estoque' } as const;
const CATEGORIAS = { SEMENTES: 'Sementes', FERTILIZANTES: 'Fertilizantes', DEFENSIVOS: 'Defensivos', COMBUSTIVEL: 'Combustível' } as const;
const TIPOS_ATIVIDADE = { PLANTIO: 'Plantio', PULVERIZACAO: 'Pulverização', ADUBACAO: 'Adubação', COLHEITA: 'Colheita', IRRIGACAO: 'Irrigação' } as const;
const SITUACOES = { AGENDADA: 'Agendada', EM_ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída', ATRASADA: 'Atrasada' } as const;
const STATUS_INSUMO = { BAIXO: 'Baixo', ATENCAO: 'Atenção', NORMAL: 'Normal' } as const;

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const data = (d: Date) => d.toLocaleDateString('pt-BR');
const dataHora = (d: Date) => `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Campos devolvidos na listagem (sem o conteúdo binário do PDF). */
const CAMPOS_PUBLICOS = {
  id: true,
  tipo: true,
  titulo: true,
  periodoInicio: true,
  periodoFim: true,
  arquivo: true,
  tamanhoBytes: true,
  geradoEm: true,
  geradoPor: { select: { id: true, nome: true } },
} as const;

export async function listar() {
  return prisma.relatorio.findMany({ select: CAMPOS_PUBLICOS, orderBy: { geradoEm: 'desc' } });
}

/** Devolve o PDF gravado (download). */
export async function baixar(id: number) {
  const relatorio = await prisma.relatorio.findUnique({ where: { id }, select: { arquivo: true, conteudo: true } });
  if (!relatorio) throw new AppError(404, 'RELATORIO_NAO_ENCONTRADO', 'Relatório não encontrado');
  return { arquivo: relatorio.arquivo, conteudo: Buffer.from(relatorio.conteudo) };
}

export async function excluir(id: number) {
  const existe = await prisma.relatorio.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw new AppError(404, 'RELATORIO_NAO_ENCONTRADO', 'Relatório não encontrado');
  await prisma.relatorio.delete({ where: { id } });
}

/**
 * RN12 — gera o relatório em PDF no servidor, a partir dos dados do período escolhido,
 * e grava o arquivo no banco junto com quem gerou e quando.
 */
export async function gerar({ tipo, inicio, fim }: GerarRelatorio, usuarioId: number) {
  const periodoInicio = limitesDoDia(inicio).inicio;
  const periodoFim = limitesDoDia(fim).fim;

  if (periodoFim < periodoInicio) {
    throw new AppError(422, 'PERIODO_INVALIDO', 'A data final deve ser igual ou posterior à data inicial');
  }
  const dias = Math.round((periodoFim.getTime() - periodoInicio.getTime()) / 86_400_000);
  if (dias > PERIODO_MAXIMO_DIAS) {
    throw new AppError(422, 'PERIODO_LONGO', `O período do relatório pode ter no máximo ${PERIODO_MAXIMO_DIAS} dias`, { dias });
  }

  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { nome: true } });
  const agora = new Date();
  const titulo = `Relatório de ${NOMES_TIPO[tipo]}`;
  const base = {
    titulo,
    periodo: `${data(periodoInicio)} a ${data(periodoFim)}`,
    geradoPor: usuario.nome,
    geradoEm: dataHora(agora),
  };

  const montar = { CUSTOS: dadosCustos, ATIVIDADES: dadosAtividades, ESTOQUE: dadosEstoque }[tipo];
  const conteudo: ConteudoRelatorio = { ...base, ...(await montar(periodoInicio, periodoFim, agora)) };
  const pdf = await montarPdf(conteudo);

  return prisma.relatorio.create({
    data: {
      tipo,
      titulo: `${titulo} — ${base.periodo}`,
      periodoInicio,
      periodoFim,
      arquivo: `relatorio-${tipo.toLowerCase()}-${iso(periodoInicio)}-a-${iso(periodoFim)}.pdf`,
      tamanhoBytes: pdf.length,
      conteudo: new Uint8Array(pdf),
      geradoPorId: usuarioId,
    },
    select: CAMPOS_PUBLICOS,
  });
}

type Secoes = Pick<ConteudoRelatorio, 'indicadores' | 'secoes' | 'observacao'>;

/** Custos: compras (entradas de estoque) do período, por categoria, por mês e item a item. */
async function dadosCustos(inicio: Date, fim: Date): Promise<Secoes> {
  const entradas = await prisma.movimentacao.findMany({
    where: { tipo: 'ENTRADA', data: { gte: inicio, lte: fim } },
    include: { insumo: { select: { nome: true, categoria: true, unidade: true } }, usuario: { select: { nome: true } } },
    orderBy: { data: 'asc' },
  });

  const valor = (e: (typeof entradas)[number]) => e.quantidade * Number(e.custoUnitario);
  const total = entradas.reduce((soma, e) => soma + valor(e), 0);

  const porCategoria = new Map<string, { qtd: number; valor: number }>();
  const porMes = new Map<string, number>();
  for (const e of entradas) {
    const c = porCategoria.get(e.insumo.categoria) ?? { qtd: 0, valor: 0 };
    c.qtd += 1;
    c.valor += valor(e);
    porCategoria.set(e.insumo.categoria, c);
    const mes = `${String(e.data.getMonth() + 1).padStart(2, '0')}/${e.data.getFullYear()}`;
    porMes.set(mes, (porMes.get(mes) ?? 0) + valor(e));
  }
  const maiorCategoria = [...porCategoria.entries()].sort((a, b) => b[1].valor - a[1].valor)[0];

  return {
    indicadores: [
      { rotulo: 'Total gasto', valor: moeda.format(total) },
      { rotulo: 'Compras registradas', valor: String(entradas.length) },
      { rotulo: 'Maior categoria', valor: maiorCategoria ? CATEGORIAS[maiorCategoria[0] as keyof typeof CATEGORIAS] : '—' },
      { rotulo: 'Meses com compras', valor: String(porMes.size) },
    ],
    secoes: [
      {
        titulo: 'Custos por categoria',
        colunas: [{ titulo: 'Categoria', largura: 3 }, { titulo: 'Compras', largura: 1.5, alinhar: 'right' }, { titulo: 'Valor', largura: 2, alinhar: 'right' }, { titulo: '% do total', largura: 1.5, alinhar: 'right' }],
        linhas: [...porCategoria.entries()]
          .sort((a, b) => b[1].valor - a[1].valor)
          .map(([cat, c]) => [CATEGORIAS[cat as keyof typeof CATEGORIAS], String(c.qtd), moeda.format(c.valor), `${numero.format(total ? (c.valor / total) * 100 : 0)}%`]),
        rodape: ['Total', String(entradas.length), moeda.format(total), '100%'],
        vazio: 'Nenhuma compra registrada no período.',
      },
      {
        titulo: 'Custos por mês',
        colunas: [{ titulo: 'Mês', largura: 3 }, { titulo: 'Valor', largura: 2, alinhar: 'right' }],
        linhas: [...porMes.entries()].map(([mes, v]) => [mes, moeda.format(v)]),
        vazio: 'Nenhuma compra registrada no período.',
      },
      {
        titulo: 'Compras do período',
        colunas: [
          { titulo: 'Data', largura: 1.4 }, { titulo: 'Insumo', largura: 3.2 }, { titulo: 'Quantidade', largura: 1.6, alinhar: 'right' },
          { titulo: 'Custo unit.', largura: 1.6, alinhar: 'right' }, { titulo: 'Total', largura: 1.8, alinhar: 'right' }, { titulo: 'Registrado por', largura: 2.2 },
        ],
        linhas: entradas.map((e) => [
          data(e.data), e.insumo.nome, `${numero.format(e.quantidade)} ${e.insumo.unidade}`,
          moeda.format(Number(e.custoUnitario)), moeda.format(valor(e)), e.usuario.nome,
        ]),
        vazio: 'Nenhuma compra registrada no período.',
      },
    ],
    observacao: 'Custo = soma das entradas de estoque (quantidade × custo unitário), o mesmo critério do gráfico do Dashboard (RN08).',
  };
}

/** Atividades: tudo o que estava previsto no período, com a situação calculada (RN04). */
async function dadosAtividades(inicio: Date, fim: Date, agora: Date): Promise<Secoes> {
  const atividades = await prisma.atividade.findMany({
    where: { dataPrevista: { gte: inicio, lte: fim } },
    include: { talhao: { select: { nome: true } }, responsavel: { select: { nome: true } } },
    orderBy: { dataPrevista: 'asc' },
  });
  const inicioDeHoje = limitesDoDia(agora).inicio;
  const situacao = (a: (typeof atividades)[number]) =>
    a.status !== 'CONCLUIDA' && a.dataPrevista < inicioDeHoje ? ('ATRASADA' as const) : a.status;

  const contagem = { AGENDADA: 0, EM_ANDAMENTO: 0, CONCLUIDA: 0, ATRASADA: 0 };
  const porTipo = new Map<string, { total: number; concluidas: number }>();
  for (const a of atividades) {
    contagem[situacao(a)] += 1;
    const t = porTipo.get(a.tipo) ?? { total: 0, concluidas: 0 };
    t.total += 1;
    if (a.status === 'CONCLUIDA') t.concluidas += 1;
    porTipo.set(a.tipo, t);
  }

  return {
    indicadores: [
      { rotulo: 'Atividades no período', valor: String(atividades.length) },
      { rotulo: 'Concluídas', valor: String(contagem.CONCLUIDA) },
      { rotulo: 'Em aberto', valor: String(contagem.EM_ANDAMENTO + contagem.AGENDADA) },
      { rotulo: 'Atrasadas', valor: String(contagem.ATRASADA) },
    ],
    secoes: [
      {
        titulo: 'Atividades por tipo',
        colunas: [{ titulo: 'Tipo', largura: 3 }, { titulo: 'Total', largura: 1.5, alinhar: 'right' }, { titulo: 'Concluídas', largura: 1.5, alinhar: 'right' }],
        linhas: [...porTipo.entries()].map(([tipo, t]) => [TIPOS_ATIVIDADE[tipo as keyof typeof TIPOS_ATIVIDADE], String(t.total), String(t.concluidas)]),
        vazio: 'Nenhuma atividade prevista no período.',
      },
      {
        titulo: 'Atividades do período',
        colunas: [
          { titulo: 'Data prevista', largura: 1.6 }, { titulo: 'Tipo', largura: 1.8 }, { titulo: 'Talhão', largura: 1.6 },
          { titulo: 'Responsável', largura: 2.2 }, { titulo: 'Situação', largura: 1.6 }, { titulo: 'Concluída em', largura: 1.6 },
        ],
        linhas: atividades.map((a) => [
          data(a.dataPrevista), TIPOS_ATIVIDADE[a.tipo], a.talhao.nome, a.responsavel.nome,
          SITUACOES[situacao(a)], a.dataConclusao ? data(a.dataConclusao) : '—',
        ]),
        vazio: 'Nenhuma atividade prevista no período.',
      },
    ],
    observacao: `A situação "Atrasada" é calculada na data de emissão (${data(agora)}): atividade não concluída com data prevista anterior a esse dia (RN04).`,
  };
}

/** Estoque: posição atual de cada insumo (RN07) e o que entrou e saiu no período. */
async function dadosEstoque(inicio: Date, fim: Date, agora: Date): Promise<Secoes> {
  const [insumos, movimentos] = await Promise.all([
    prisma.insumo.findMany({ orderBy: { nome: 'asc' } }),
    prisma.movimentacao.groupBy({
      by: ['insumoId', 'tipo'],
      where: { data: { gte: inicio, lte: fim } },
      _sum: { quantidade: true },
    }),
  ]);

  const movimentoDe = (insumoId: number, tipo: 'ENTRADA' | 'SAIDA') =>
    movimentos.find((m) => m.insumoId === insumoId && m.tipo === tipo)?._sum.quantidade ?? 0;
  const status = insumos.map((i) => statusDoInsumo(i.quantidade, i.estoqueMinimo));
  const valorEmEstoque = insumos.reduce((soma, i) => soma + i.quantidade * Number(i.custoUnitario), 0);

  return {
    indicadores: [
      { rotulo: 'Insumos cadastrados', valor: String(insumos.length) },
      { rotulo: 'Valor em estoque', valor: moeda.format(valorEmEstoque) },
      { rotulo: 'Status baixo', valor: String(status.filter((s) => s === 'BAIXO').length) },
      { rotulo: 'Status atenção', valor: String(status.filter((s) => s === 'ATENCAO').length) },
    ],
    secoes: [
      {
        titulo: `Posição do estoque em ${data(agora)}`,
        colunas: [
          { titulo: 'Insumo', largura: 3 }, { titulo: 'Categoria', largura: 1.8 }, { titulo: 'Saldo', largura: 1.6, alinhar: 'right' },
          { titulo: 'Mínimo', largura: 1.4, alinhar: 'right' }, { titulo: 'Status', largura: 1.2 }, { titulo: 'Valor', largura: 1.8, alinhar: 'right' },
        ],
        linhas: insumos.map((i, n) => [
          i.nome, CATEGORIAS[i.categoria], `${numero.format(i.quantidade)} ${i.unidade}`, numero.format(i.estoqueMinimo),
          STATUS_INSUMO[status[n]], moeda.format(i.quantidade * Number(i.custoUnitario)),
        ]),
        rodape: ['Total', '', '', '', '', moeda.format(valorEmEstoque)],
        vazio: 'Nenhum insumo cadastrado.',
      },
      {
        titulo: 'Movimentações no período',
        colunas: [{ titulo: 'Insumo', largura: 3 }, { titulo: 'Entradas', largura: 1.8, alinhar: 'right' }, { titulo: 'Saídas', largura: 1.8, alinhar: 'right' }],
        linhas: insumos
          .filter((i) => movimentoDe(i.id, 'ENTRADA') || movimentoDe(i.id, 'SAIDA'))
          .map((i) => [i.nome, `${numero.format(movimentoDe(i.id, 'ENTRADA'))} ${i.unidade}`, `${numero.format(movimentoDe(i.id, 'SAIDA'))} ${i.unidade}`]),
        vazio: 'Nenhuma movimentação no período.',
      },
    ],
    observacao: 'Status do insumo (RN07): Baixo quando o saldo é menor ou igual ao mínimo; Atenção até 1,5 vez o mínimo; Normal acima disso.',
  };
}
