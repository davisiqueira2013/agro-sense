// Dados fictícios do protótipo (Fase 01).
// Talhões, atividades, estoque, alertas, diário e usuário logado já vêm da API.
// Cada array restante será substituído por uma chamada à API na Fase 02,
// por meio da camada src/services. Mantê-los separados das telas
// permite trocar a fonte de dados sem alterar os componentes visuais.

import type {
  Relatorio,
  Usuario,
} from '../types';

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

