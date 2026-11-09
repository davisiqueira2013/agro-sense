import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, entrar, prisma, reiniciarBanco, USUARIOS } from './helpers.js';

beforeEach(reiniciarBanco);
afterEach(() => vi.restoreAllMocks());

/** Simula a resposta do Open-Meteo: 2 dias de previsão com os valores informados. */
function simularOpenMeteo({ minima = 15, chuva = 0, rajada = 10 }) {
  const hoje = new Date();
  const dia = (n: number) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    new Response(JSON.stringify({
      current: { temperature_2m: 21.4, relative_humidity_2m: 70 },
      daily: { time: [dia(0), dia(1)], temperature_2m_min: [minima, minima], precipitation_sum: [chuva, 0], wind_gusts_10m_max: [rajada, rajada] },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  );
}

describe('RN09 — alertas a partir da previsão do tempo', () => {
  it('CT-33 rajadas acima de 40 km/h geram alerta automático de vento forte', async () => {
    const ana = await entrar(USUARIOS.ana);
    const fetch = simularOpenMeteo({ rajada: 55 });
    const r = await api().post('/api/alertas/sincronizar').set(ana);
    expect(r.status).toBe(200);
    expect(fetch).toHaveBeenCalled();
    const alerta = await prisma.alertaClimatico.findFirst({ where: { origem: 'PREVISAO', tipo: 'VENTO_FORTE', ativo: true }, include: { talhoes: true } });
    expect(alerta).not.toBeNull();
    expect(alerta!.talhoes.length).toBe(await prisma.talhao.count());
  });

  it('CT-34 temperatura abaixo de 2 °C gera alerta de geada; chuva acima de 50 mm gera chuva intensa', async () => {
    const ana = await entrar(USUARIOS.ana);
    simularOpenMeteo({ minima: 1.2, chuva: 62 });
    await api().post('/api/alertas/sincronizar').set(ana).expect(200);
    const tipos = (await prisma.alertaClimatico.findMany({ where: { origem: 'PREVISAO', ativo: true } })).map((a) => a.tipo).sort();
    expect(tipos).toEqual(['CHUVA_INTENSA', 'GEADA']);
  });

  it('CT-35 valores no limite (2 °C, 50 mm, 40 km/h) não geram alerta', async () => {
    const ana = await entrar(USUARIOS.ana);
    simularOpenMeteo({ minima: 2, chuva: 50, rajada: 40 });
    await api().post('/api/alertas/sincronizar').set(ana).expect(200);
    expect(await prisma.alertaClimatico.count({ where: { origem: 'PREVISAO' } })).toBe(0);
  });

  it('CT-36 a sincronização atualiza temperatura e umidade dos talhões', async () => {
    const ana = await entrar(USUARIOS.ana);
    simularOpenMeteo({});
    await api().post('/api/alertas/sincronizar').set(ana).expect(200);
    const talhoes = await prisma.talhao.findMany();
    for (const t of talhoes) expect([t.temperaturaAtual, t.umidadeAtual]).toEqual([21.4, 70]);
  });

  it('CT-37 se o Open-Meteo estiver fora do ar, a API responde 502 e nada é alterado', async () => {
    const ana = await entrar(USUARIOS.ana);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fetch failed'));
    const antes = await prisma.alertaClimatico.count();
    const r = await api().post('/api/alertas/sincronizar').set(ana);
    expect(r.status).toBe(502);
    expect(r.body.codigo).toBe('CLIMA_INDISPONIVEL');
    expect(await prisma.alertaClimatico.count()).toBe(antes);
  });

  it('CT-38 alerta encerrado não pode ser encerrado de novo (422)', async () => {
    const ana = await entrar(USUARIOS.ana);
    const alerta = await prisma.alertaClimatico.findFirstOrThrow({ where: { ativo: true } });
    await api().patch(`/api/alertas/${alerta.id}/encerrar`).set(ana).expect(200);
    const r = await api().patch(`/api/alertas/${alerta.id}/encerrar`).set(ana);
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('ALERTA_ENCERRADO');
  });
});
