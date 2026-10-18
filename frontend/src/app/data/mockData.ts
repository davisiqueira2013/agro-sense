// Dados fictícios do protótipo (Fase 01).
// Talhões, atividades, estoque e usuário logado já vêm da API.
// Cada array restante será substituído por uma chamada à API na Fase 02,
// por meio da camada src/services. Mantê-los separados das telas
// permite trocar a fonte de dados sem alterar os componentes visuais.

import type {
  AlertaClimatico,
  CustoMensal,
  IndicadorDashboard,
  RegistroDiario,
  Relatorio,
  Usuario,
} from '../types';



export const registrosDiario: RegistroDiario[] = [
  { data: '10 Dez 2026', autor: 'Ana Ferreira', titulo: 'Identificação de praga inicial', texto: 'Encontrado foco inicial de mosca-branca nas bordaduras do Talhão A1. Recomendada aplicação direcionada nos próximos 2 dias.', tag: 'Pragas' },
  { data: '08 Dez 2026', autor: 'Carlos Mendes', titulo: 'Condições do solo pós-chuva', texto: 'Avaliamos a umidade do solo no Talhão C3. Solo em capacidade de campo excelente para entrada de maquinário pesado.', tag: 'Solo' },
];



export const alertas: AlertaClimatico[] = [
  { severidade: 'Crítico', titulo: 'Risco de Geada Extrema', local: 'Talhão B2, Talhão F6', descricao: 'Previsão de temperatura abaixo de 2°C para as próximas 48 horas.' },
  { severidade: 'Atenção', titulo: 'Chuva Intensa', local: 'Toda a fazenda', descricao: 'Acumulado previsto de 80mm em 24h. Risco de erosão em áreas preparadas.' },
  { severidade: 'Aviso', titulo: 'Vento Forte', local: 'Talhão A1, Talhão C3', descricao: 'Rajadas acima de 40km/h. Suspender pulverizações agendadas.' },
];

export const relatorios: Relatorio[] = [
  { nome: 'Fechamento de Custos Mensal', data: '01 Dez 2026', tamanho: '2.4 MB' },
  { nome: 'Produtividade por Talhão', data: '15 Nov 2026', tamanho: '4.1 MB' },
  { nome: 'Histórico de Atividades (Semestre)', data: '01 Nov 2026', tamanho: '1.8 MB' },
  { nome: 'Inventário de Estoque Atualizado', data: '30 Out 2026', tamanho: '850 KB' },
];

export const usuarios: Usuario[] = [
  { nome: 'Rodrigo Figueiredo', email: 'rodrigo@agrosense.com.br', cargo: 'Administrador', status: 'Ativo' },
  { nome: 'Ana Ferreira', email: 'ana.agronoma@agrosense.com.br', cargo: 'Engenheira Agrônoma', status: 'Ativo' },
  { nome: 'Carlos Mendes', email: 'carlos.op@agrosense.com.br', cargo: 'Operador de Máquinas', status: 'Ativo' },
  { nome: 'José Silva', email: 'jose.silva@agrosense.com.br', cargo: 'Consultor Externo', status: 'Inativo' },
];

/** Nome da propriedade exibido na barra lateral. */
export const NOME_FAZENDA = 'Fazenda Figueiredo';

export const indicadoresDashboard: IndicadorDashboard[] = [
  { titulo: 'Total de Talhões', valor: '6', detalhe: '3 ativos agora', tone: 'green', icone: 'talhoes' },
  { titulo: 'Alertas Ativos', valor: '3', detalhe: '3 alta, 0 crítica', tone: 'red', icone: 'alertas' },
  { titulo: 'Gasto do Mês', valor: 'R$ 16.400', detalhe: 'Dezembro/2026', tone: 'yellow', icone: 'gastos' },
  { titulo: 'Insumos Críticos', valor: '4', detalhe: 'abaixo do mínimo', tone: 'red', icone: 'insumos' },
];

/** Valores em milhares de reais (escala do gráfico vai de 0 a 60k). */
export const custosMensais: CustoMensal[] = [
  { mes: 'Jul', valor: 12 },
  { mes: 'Ago', valor: 15 },
  { mes: 'Set', valor: 10.8 },
  { mes: 'Out', valor: 13.2 },
  { mes: 'Nov', valor: 18 },
  { mes: 'Dez', valor: 9 },
];

export const alertasRapidos = [
  { titulo: 'Chuva Intensa', talhao: 'Talhão C3', tone: 'red' as const },
  { titulo: 'Geada', talhao: 'Talhão B2', tone: 'yellow' as const },
  { titulo: 'Vento Forte', talhao: 'Talhão A1', tone: 'yellow' as const },
];
