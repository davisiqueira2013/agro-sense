import type { Prisma, Severidade, TipoAlerta } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { limitesDoDia } from '../../lib/validacao.js';
import type { CriarAlerta } from './alertas.schema.js';
import { consultarPrevisao } from './clima.service.js';

/**
 * RN09 — limites que geram alertas a partir da previsão das próximas 48 h.
 * Valores sugeridos para o projeto; podem ser ajustados por um agrônomo.
 */
export const LIMITES = {
  GEADA_TEMPERATURA_MINIMA_C: 2, // mínima abaixo de 2 °C
  CHUVA_INTENSA_MM_DIA: 50, // acumulado acima de 50 mm em 24 h
  VENTO_FORTE_RAJADA_KMH: 40, // rajadas acima de 40 km/h
};

const PADRAO_POR_TIPO: Record<TipoAlerta, { severidade: Severidade; titulo: string }> = {
  GEADA: { severidade: 'CRITICO', titulo: 'Risco de Geada' },
  CHUVA_INTENSA: { severidade: 'ATENCAO', titulo: 'Chuva Intensa' },
  VENTO_FORTE: { severidade: 'AVISO', titulo: 'Vento Forte' },
};

/** Alerta ativo agora: marcado como ativo e ainda não encerrado. */
export const filtroAlertaAtivo = (agora = new Date()): Prisma.AlertaClimaticoWhereInput => ({
  ativo: true,
  OR: [{ fim: null }, { fim: { gt: agora } }],
});

const comTalhoes = { talhoes: { select: { id: true, nome: true }, orderBy: { nome: 'asc' } } } as const;
type AlertaComTalhoes = Prisma.AlertaClimaticoGetPayload<{ include: typeof comTalhoes }>;

async function paraResposta(alertas: AlertaComTalhoes[]) {
  const totalTalhoes = await prisma.talhao.count();
  const agora = new Date();
  return alertas.map((a) => ({
    ...a,
    situacao: a.ativo && (!a.fim || a.fim > agora) ? ('ATIVO' as const) : ('ENCERRADO' as const),
    todaFazenda: totalTalhoes > 0 && a.talhoes.length === totalTalhoes,
  }));
}

export async function listar(situacao: 'ativos' | 'encerrados' | 'todos') {
  const ativo = filtroAlertaAtivo();
  const where: Prisma.AlertaClimaticoWhereInput =
    situacao === 'ativos' ? ativo : situacao === 'encerrados' ? { NOT: ativo } : {};
  const alertas = await prisma.alertaClimatico.findMany({
    where,
    include: comTalhoes,
    orderBy: [{ severidade: 'asc' }, { inicio: 'desc' }],
    take: situacao === 'ativos' ? undefined : 100,
  });
  return paraResposta(alertas);
}

export async function criar(dados: CriarAlerta) {
  const talhoes = await prisma.talhao.findMany({ where: { id: { in: dados.talhaoIds } }, select: { id: true } });
  if (talhoes.length !== new Set(dados.talhaoIds).size) {
    throw new AppError(422, 'TALHAO_NAO_ENCONTRADO', 'Um ou mais talhões selecionados não existem');
  }
  const padrao = PADRAO_POR_TIPO[dados.tipo];
  const alerta = await prisma.alertaClimatico.create({
    data: {
      tipo: dados.tipo,
      severidade: dados.severidade ?? padrao.severidade,
      titulo: dados.titulo || padrao.titulo,
      descricao: dados.descricao,
      inicio: limitesDoDia(dados.inicio).inicio,
      fim: dados.fim ? limitesDoDia(dados.fim).fim : null,
      origem: 'MANUAL',
      talhoes: { connect: talhoes },
    },
    include: comTalhoes,
  });
  return (await paraResposta([alerta]))[0];
}

export async function encerrar(id: number) {
  const alerta = await prisma.alertaClimatico.findUnique({ where: { id } });
  if (!alerta) throw new AppError(404, 'ALERTA_NAO_ENCONTRADO', 'Alerta não encontrado');
  const agora = new Date();
  if (!alerta.ativo || (alerta.fim && alerta.fim <= agora)) {
    throw new AppError(422, 'ALERTA_ENCERRADO', 'Este alerta já está encerrado');
  }
  const atualizado = await prisma.alertaClimatico.update({
    where: { id },
    data: { ativo: false, fim: agora },
    include: comTalhoes,
  });
  return (await paraResposta([atualizado]))[0];
}

const numero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/**
 * RN09 — sincroniza com a previsão do tempo.
 * 1. Consulta o Open-Meteo para cada talhão com coordenadas.
 * 2. Atualiza temperatura e umidade atuais do talhão.
 * 3. Para cada tipo de risco, cria ou atualiza o alerta automático (origem PREVISAO)
 *    com os talhões afetados, ou encerra o alerta automático se o risco passou.
 * Alertas registrados manualmente pela equipe não são alterados.
 */
export async function sincronizar() {
  const talhoes = await prisma.talhao.findMany({ orderBy: { nome: 'asc' } });
  const comCoordenadas = talhoes.filter((t) => t.latitude !== null && t.longitude !== null);
  const semCoordenadas = talhoes.filter((t) => t.latitude === null || t.longitude === null).map((t) => t.nome);

  if (comCoordenadas.length === 0) {
    throw new AppError(422, 'SEM_COORDENADAS', 'Nenhum talhão tem latitude e longitude cadastradas');
  }

  const resultados = await Promise.allSettled(comCoordenadas.map((t) => consultarPrevisao(t.latitude!, t.longitude!)));

  const falhas: { talhao: string; motivo: string }[] = [];
  const riscos: Record<TipoAlerta, { talhaoId: number; texto: string; dia: Date }[]> = { GEADA: [], CHUVA_INTENSA: [], VENTO_FORTE: [] };
  const agora = new Date();

  for (const [i, resultado] of resultados.entries()) {
    const talhao = comCoordenadas[i];
    if (resultado.status === 'rejected') {
      falhas.push({ talhao: talhao.nome, motivo: String(resultado.reason?.message ?? resultado.reason) });
      continue;
    }
    const previsao = resultado.value;
    await prisma.talhao.update({
      where: { id: talhao.id },
      data: {
        temperaturaAtual: Math.round(previsao.temperaturaAtual * 10) / 10,
        umidadeAtual: Math.round(previsao.umidadeAtual),
        climaAtualizadoEm: agora,
      },
    });

    for (const dia of previsao.dias) {
      if (dia.temperaturaMinima < LIMITES.GEADA_TEMPERATURA_MINIMA_C) {
        riscos.GEADA.push({ talhaoId: talhao.id, dia: dia.data, texto: `${talhao.nome}: mínima de ${numero(dia.temperaturaMinima)} °C` });
      }
      if (dia.chuvaMm > LIMITES.CHUVA_INTENSA_MM_DIA) {
        riscos.CHUVA_INTENSA.push({ talhaoId: talhao.id, dia: dia.data, texto: `${talhao.nome}: ${numero(dia.chuvaMm)} mm` });
      }
      if (dia.rajadaKmh > LIMITES.VENTO_FORTE_RAJADA_KMH) {
        riscos.VENTO_FORTE.push({ talhaoId: talhao.id, dia: dia.data, texto: `${talhao.nome}: rajadas de ${numero(dia.rajadaKmh)} km/h` });
      }
    }
  }

  if (falhas.length === comCoordenadas.length) {
    throw new AppError(502, 'CLIMA_INDISPONIVEL', 'Não foi possível consultar a previsão do tempo (Open-Meteo). Verifique a conexão com a internet.', { falhas });
  }

  const explicacao: Record<TipoAlerta, string> = {
    GEADA: `Previsão de temperatura abaixo de ${LIMITES.GEADA_TEMPERATURA_MINIMA_C} °C nas próximas 48 horas`,
    CHUVA_INTENSA: `Previsão de chuva acima de ${LIMITES.CHUVA_INTENSA_MM_DIA} mm em 24 horas. Risco de erosão em áreas preparadas`,
    VENTO_FORTE: `Rajadas acima de ${LIMITES.VENTO_FORTE_RAJADA_KMH} km/h previstas. Suspender pulverizações`,
  };

  const resumo = { criados: 0, atualizados: 0, encerrados: 0 };

  for (const tipo of Object.keys(riscos) as TipoAlerta[]) {
    const lista = riscos[tipo];
    const existente = await prisma.alertaClimatico.findFirst({ where: { tipo, origem: 'PREVISAO', ...filtroAlertaAtivo(agora) } });

    if (lista.length === 0) {
      if (existente) {
        await prisma.alertaClimatico.update({ where: { id: existente.id }, data: { ativo: false, fim: agora } });
        resumo.encerrados += 1;
      }
      continue;
    }

    const dias = lista.map((r) => r.dia.getTime());
    const talhaoIds = [...new Set(lista.map((r) => r.talhaoId))].map((id) => ({ id }));
    const dados = {
      severidade: PADRAO_POR_TIPO[tipo].severidade,
      titulo: PADRAO_POR_TIPO[tipo].titulo,
      descricao: `${explicacao[tipo]}. ${[...new Set(lista.map((r) => r.texto))].join('; ')}.`,
      inicio: limitesDoDia(new Date(Math.min(...dias))).inicio,
      fim: limitesDoDia(new Date(Math.max(...dias))).fim,
    };

    if (existente) {
      await prisma.alertaClimatico.update({ where: { id: existente.id }, data: { ...dados, talhoes: { set: talhaoIds } } });
      resumo.atualizados += 1;
    } else {
      await prisma.alertaClimatico.create({ data: { ...dados, tipo, origem: 'PREVISAO', talhoes: { connect: talhaoIds } } });
      resumo.criados += 1;
    }
  }

  return {
    consultadoEm: agora.toISOString(),
    talhoesConsultados: comCoordenadas.length - falhas.length,
    semCoordenadas,
    falhas,
    alertas: resumo,
    limites: LIMITES,
  };
}
