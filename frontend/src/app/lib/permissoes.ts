import type { Perfil } from '../types';

// RN02 — o que cada perfil pode fazer na interface.
// O backend aplica as mesmas regras (403); aqui só escondemos o que não está disponível.
export const permissoes = (perfil: Perfil) => ({
  /** Criar e editar dados operacionais (talhões, atividades, estoque...). */
  podeEditar: perfil === 'ADMIN' || perfil === 'TECNICO',
  /** Excluir registros. */
  podeExcluir: perfil === 'ADMIN',
});
