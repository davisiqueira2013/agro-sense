import { API_URL } from '../config';

const CHAVE_TOKEN = 'agrosense:token';

/** Evento disparado quando a API recusa o token (401); o AuthContext volta para o login. */
export const EVENTO_SESSAO_EXPIRADA = 'agrosense:sessao-expirada';

/** Erro devolvido pela API no formato { erro, codigo, detalhes? }. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem: string,
    public readonly detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'ApiError';
  }
}

export const tokenStorage = {
  ler: () => {
    try {
      return localStorage.getItem(CHAVE_TOKEN);
    } catch {
      return null;
    }
  },
  salvar: (token: string) => {
    try {
      localStorage.setItem(CHAVE_TOKEN, token);
    } catch {
      /* navegação privada sem storage: o login vale só até recarregar */
    }
  },
  apagar: () => {
    try {
      localStorage.removeItem(CHAVE_TOKEN);
    } catch {
      /* ignora */
    }
  },
};

/**
 * Cliente HTTP único do frontend. Todas as telas falam com o backend por aqui:
 * - monta a URL a partir de VITE_API_URL;
 * - envia e recebe JSON;
 * - anexa o token JWT no cabeçalho Authorization;
 * - converte respostas de erro em ApiError com a mensagem da API.
 */
export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = tokenStorage.ler();

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opcoes.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'SEM_CONEXAO', 'Não foi possível conectar à API. Verifique se o backend está rodando.');
  }

  if (resposta.status === 204) return undefined as T;

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // Token recusado em uma rota protegida → encerra a sessão no frontend.
    if (resposta.status === 401 && token) {
      tokenStorage.apagar();
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
    throw new ApiError(resposta.status, corpo.codigo ?? 'ERRO', corpo.erro ?? 'Falha na comunicação com o servidor', corpo.detalhes);
  }

  return corpo as T;
}
