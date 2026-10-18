import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UsuarioLogado } from '../app/types';
import { EVENTO_SESSAO_EXPIRADA, tokenStorage } from '../services/api';
import { authService } from '../services/authService';

type AuthContextValor = {
  usuario: UsuarioLogado | null;
  /** true enquanto confere o token salvo ao abrir o sistema. */
  carregando: boolean;
  /** Mensagem mostrada na tela de login (ex.: sessão expirada). */
  aviso: string;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(() => !!tokenStorage.ler());
  const [aviso, setAviso] = useState('');

  // Ao abrir o sistema: se há token salvo, pergunta à API de quem ele é.
  useEffect(() => {
    if (!tokenStorage.ler()) return;
    authService
      .me()
      .then(setUsuario)
      .catch(() => tokenStorage.apagar())
      .finally(() => setCarregando(false));
  }, []);

  // A API recusou o token em alguma tela → volta para o login.
  useEffect(() => {
    const aoExpirar = () => {
      setUsuario(null);
      setAviso('Sua sessão expirou. Faça login novamente.');
    };
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const resposta = await authService.login(email, senha);
    tokenStorage.salvar(resposta.token);
    setAviso('');
    setUsuario(resposta.usuario);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.apagar();
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, carregando, aviso, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return contexto;
}
