import type { Perfil } from '../types';

// RN02 — o que cada perfil pode fazer na interface.
// O backend aplica as mesmas regras (403); aqui só escondemos o que não está disponível.
export const permissoes = (perfil: Perfil) => ({
  /** Criar e editar dados operacionais (talhões, atividades, estoque...). */
  podeEditar: perfil === 'ADMIN' || perfil === 'TECNICO',
  /** Excluir registros. */
  podeExcluir: perfil === 'ADMIN',
});

/** RN10 — registro do diário: só o autor ou um ADMIN altera/exclui. */
export const podeAlterarRegistro = (usuario: { id: number; perfil: Perfil }, autorId: number) =>
  usuario.perfil === 'ADMIN' || (usuario.perfil === 'TECNICO' && usuario.id === autorId);
