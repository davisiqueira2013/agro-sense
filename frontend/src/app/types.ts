// Tipos compartilhados pelas telas do Agro Sense.
// Na integração com o backend, estes tipos devem espelhar as respostas da API.

export type TabId =
  | 'Dashboard'
  | 'Talhões'
  | 'Atividades'
  | 'Diário de Campo'
  | 'Estoque'
  | 'Alertas Climáticos'
  | 'Relatórios PDF'
  | 'Usuários';

/** Paleta semântica usada em badges, ícones e bordas. */
export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export type StatusTalhao = 'EM_PREPARO' | 'ATIVO' | 'COLHIDO';

/** Talhão como devolvido por GET /api/talhoes. */
export type Talhao = {
  id: number;
  nome: string;
  municipio: string;
  uf: string;
  cultura: string;
  areaHa: number;
  status: StatusTalhao;
  latitude: number | null;
  longitude: number | null;
  temperaturaAtual: number | null;
  umidadeAtual: number | null;
  climaAtualizadoEm: string | null;
  _count: { atividades: number };
};

/** Corpo enviado em POST /api/talhoes e PUT /api/talhoes/:id. */
export type TalhaoEntrada = {
  nome: string;
  municipio: string;
  uf: string;
  cultura: string;
  areaHa: number;
  status: StatusTalhao;
  latitude?: number;
  longitude?: number;
};

export type TipoAtividade = 'PLANTIO' | 'PULVERIZACAO' | 'ADUBACAO' | 'COLHEITA' | 'IRRIGACAO';

/** Situação exibida; ATRASADA é calculada pela API (RN04). */
export type SituacaoAtividade = 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA';

/** Atividade como devolvida por GET /api/atividades. */
export type Atividade = {
  id: number;
  tipo: TipoAtividade;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  situacao: SituacaoAtividade;
  dataPrevista: string;
  dataConclusao: string | null;
  observacao: string | null;
  talhao: { id: number; nome: string };
  responsavel: { id: number; nome: string };
};

/** Corpo de POST /api/atividades e PUT /api/atividades/:id. */
export type AtividadeEntrada = {
  tipo: TipoAtividade;
  talhaoId: number;
  responsavelId: number;
  /** AAAA-MM-DD */
  dataPrevista: string;
  observacao?: string;
};

/** Usuário que pode receber atividades (GET /api/usuarios/responsaveis). */
export type Responsavel = { id: number; nome: string; cargo: string };

export type CategoriaRegistro = 'PRAGAS' | 'SOLO' | 'CLIMA' | 'DOENCAS' | 'GERAL';

/** Registro como devolvido por GET /api/diario. */
export type RegistroDiario = {
  id: number;
  titulo: string;
  texto: string;
  categoria: CategoriaRegistro;
  data: string;
  autor: { id: number; nome: string };
  talhao: { id: number; nome: string } | null;
};

export type RegistroEntrada = {
  titulo: string;
  texto: string;
  categoria: CategoriaRegistro;
  talhaoId?: number | null;
  /** AAAA-MM-DD */
  data?: string;
};

export type CategoriaInsumo = 'SEMENTES' | 'FERTILIZANTES' | 'DEFENSIVOS' | 'COMBUSTIVEL';
export type StatusInsumo = 'NORMAL' | 'ATENCAO' | 'BAIXO';

/** Insumo como devolvido por GET /api/insumos (status calculado pela API, RN07). */
export type Insumo = {
  id: number;
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  quantidade: number;
  estoqueMinimo: number;
  custoUnitario: number;
  valorEmEstoque: number;
  status: StatusInsumo;
};

export type InsumoEntrada = {
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  estoqueMinimo: number;
  custoUnitario: number;
  quantidadeInicial?: number;
};

export type ResumoEstoque = { totalItens: number; abaixoMinimo: number; emAtencao: number; valorEstimado: number };

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export type Movimentacao = {
  id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  custoUnitario: number;
  data: string;
  usuario: { nome: string };
  atividade: { id: number; tipo: TipoAtividade } | null;
};

export type TipoAlerta = 'GEADA' | 'CHUVA_INTENSA' | 'VENTO_FORTE';

/** Alerta como devolvido por GET /api/alertas. */
export type AlertaClimatico = {
  id: number;
  tipo: TipoAlerta;
  severidade: Severidade;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string | null;
  origem: 'MANUAL' | 'PREVISAO';
  situacao: 'ATIVO' | 'ENCERRADO';
  todaFazenda: boolean;
  talhoes: { id: number; nome: string }[];
};

export type AlertaEntrada = {
  tipo: TipoAlerta;
  severidade?: Severidade;
  descricao: string;
  talhaoIds: number[];
  /** AAAA-MM-DD */
  inicio: string;
  fim?: string;
};

/** POST /api/alertas/sincronizar */
export type ResultadoSincronizacao = {
  consultadoEm: string;
  talhoesConsultados: number;
  semCoordenadas: string[];
  falhas: { talhao: string; motivo: string }[];
  alertas: { criados: number; atualizados: number; encerrados: number };
};

export type Relatorio = {
  nome: string;
  data: string;
  tamanho: string;
};

export type Usuario = {
  nome: string;
  email: string;
  cargo: string;
  status: 'Ativo' | 'Inativo';
};

export type Severidade = 'CRITICO' | 'ATENCAO' | 'AVISO';

/** GET /api/dashboard/resumo — indicadores calculados pela API (RN08). */
export type ResumoDashboard = {
  data: string;
  talhoes: { total: number; ativos: number };
  alertas: { ativos: number; porSeveridade: Record<Severidade, number> };
  gastoMes: { valor: number; referencia: string };
  insumos: { criticos: number; emAtencao: number };
  atividades: { atrasadas: number; hoje: number };
  alertasRapidos: { id: number; titulo: string; severidade: Severidade; talhoes: string[]; todaFazenda: boolean }[];
};

/** GET /api/dashboard/custos — um item por mês. */
export type CustoMensal = Record<CategoriaInsumo, number> & { mes: string; rotulo: string; total: number };

export type Perfil = 'ADMIN' | 'TECNICO' | 'LEITOR';

/** Usuário autenticado, como devolvido por /api/auth/login e /api/auth/me. */
export type UsuarioLogado = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  perfil: Perfil;
  ativo: boolean;
};
