// Configurações lidas das variáveis de ambiente (arquivo .env).

/**
 * Endereço da API. VITE_API_URL aceita:
 * - a URL completa, em desenvolvimento: http://localhost:3333/api
 * - só o host do serviço publicado (preenchido pelo render.yaml): agro-sense-api.onrender.com
 */
function enderecoDaApi(valor: string | undefined) {
  if (!valor) return 'http://localhost:3333/api';
  if (/^https?:\/\//.test(valor)) return valor.replace(/\/$/, '');
  return `https://${valor}/api`;
}

export const API_URL = enderecoDaApi(import.meta.env.VITE_API_URL);
