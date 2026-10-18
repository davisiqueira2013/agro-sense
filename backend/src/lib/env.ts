// Variáveis de ambiente obrigatórias, conferidas quando a API sobe.

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Confira o arquivo backend/.env (modelo em .env.example).`);
  }
  return valor;
}

export const env = {
  JWT_SECRET: obrigatoria('JWT_SECRET'),
  /** Validade do token de login. */
  JWT_EXPIRA_EM: process.env.JWT_EXPIRA_EM ?? '8h',
  /** Endpoint de previsão do Open-Meteo (gratuito, sem chave para uso não comercial). */
  OPEN_METEO_URL: process.env.OPEN_METEO_URL ?? 'https://api.open-meteo.com/v1/forecast',
};
