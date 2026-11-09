// Configurações lidas das variáveis de ambiente (arquivo .env).

/**
 * Endereço da API. VITE_API_URL aceita:
 * - a URL completa, em desenvolvimento: http://localhost:3333/api
 * - um caminho relativo, quando a API serve o próprio site (publicação): /api
 * - só o host de uma API publicada em outro endereço: minha-api.onrender.com
 */
function enderecoDaApi(valor: string | undefined) {
  if (!valor) return 'http://localhost:3333/api';
  if (/^https?:\/\//.test(valor) || valor.startsWith('/')) return valor.replace(/\/$/, '');
  return `https://${valor}/api`;
}

export const API_URL = enderecoDaApi(import.meta.env.VITE_API_URL);
