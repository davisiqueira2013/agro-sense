import { env } from '../../lib/env.js';

/**
 * Integração com o serviço externo Open-Meteo (https://open-meteo.com).
 * Consulta, por coordenada, as condições atuais e a previsão diária das próximas 48 horas.
 */

export type PrevisaoTalhao = {
  temperaturaAtual: number;
  umidadeAtual: number;
  dias: { data: Date; temperaturaMinima: number; chuvaMm: number; rajadaKmh: number }[];
};

type RespostaOpenMeteo = {
  current?: { temperature_2m: number; relative_humidity_2m: number };
  daily?: {
    time: string[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    wind_gusts_10m_max: (number | null)[];
  };
  error?: boolean;
  reason?: string;
};

export async function consultarPrevisao(latitude: number, longitude: number): Promise<PrevisaoTalhao> {
  const url = new URL(env.OPEN_METEO_URL);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m',
    daily: 'temperature_2m_min,precipitation_sum,wind_gusts_10m_max',
    forecast_days: '2',
    timezone: 'America/Sao_Paulo',
  }).toString();

  const resposta = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const corpo = (await resposta.json().catch(() => ({}))) as RespostaOpenMeteo;
  if (!resposta.ok || corpo.error || !corpo.current || !corpo.daily) {
    throw new Error(corpo.reason ?? `Open-Meteo respondeu ${resposta.status}`);
  }

  const { daily } = corpo;
  return {
    temperaturaAtual: corpo.current.temperature_2m,
    umidadeAtual: corpo.current.relative_humidity_2m,
    dias: daily.time.map((dia, i) => ({
      // Meio-dia local, como as demais datas do calendário no sistema.
      data: new Date(`${dia}T12:00:00`),
      temperaturaMinima: daily.temperature_2m_min[i] ?? Number.POSITIVE_INFINITY,
      chuvaMm: daily.precipitation_sum[i] ?? 0,
      rajadaKmh: daily.wind_gusts_10m_max[i] ?? 0,
    })),
  };
}
