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

export type Atividade = {
  status: 'Concluído' | 'Em andamento' | 'Atrasado' | 'Agendado';
  tipo: string;
  talhao: string;
  data: string;
  responsavel: string;
};

export type RegistroDiario = {
  data: string;
  autor: string;
  titulo: string;
  texto: string;
  tag: string;
};

export type Insumo = {
  nome: string;
  categoria: string;
  quantidade: string;
  status: 'Normal' | 'Atenção' | 'Baixo';
};

export type AlertaClimatico = {
  severidade: 'Crítico' | 'Atenção' | 'Aviso';
  titulo: string;
  local: string;
  descricao: string;
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

export type IndicadorDashboard = {
  titulo: string;
  valor: string;
  detalhe: string;
  tone: Tone;
  icone: 'talhoes' | 'alertas' | 'gastos' | 'insumos';
};

export type CustoMensal = {
  mes: string;
  valor: number;
};

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
