import { describe, expect, it } from 'vitest';
import { api } from './helpers.js';

describe('Sistema e integração', () => {
  it('CT-55 /api/health confirma API no ar e banco conectado', async () => {
    const r = await api().get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', banco: 'conectado' });
  });

  it('CT-56 a documentação OpenAPI lista as rotas de todos os módulos', async () => {
    const r = await api().get('/api/docs.json');
    expect(r.status).toBe(200);
    for (const rota of ['/auth/login', '/talhoes', '/atividades', '/insumos', '/dashboard/resumo', '/alertas', '/diario', '/usuarios', '/relatorios']) {
      expect(Object.keys(r.body.paths)).toContain(rota);
    }
  });

  it('CT-57 rota inexistente responde 404 no formato padrão de erro', async () => {
    const r = await api().get('/api/nao-existe');
    expect(r.status).toBe(404);
    expect(r.body).toMatchObject({ codigo: 'ROTA_NAO_ENCONTRADA' });
    expect(typeof r.body.erro).toBe('string');
  });

  it('CT-58 CORS libera somente a origem do frontend', async () => {
    const liberada = await api().get('/api/health').set('Origin', 'http://localhost:5173');
    expect(liberada.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const bloqueada = await api().get('/api/health').set('Origin', 'http://site-malicioso.com');
    expect(bloqueada.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('CT-59 JSON malformado no corpo responde 400', async () => {
    const r = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{"email": ');
    expect(r.status).toBe(400);
    expect(r.body.codigo).toBe('JSON_INVALIDO');
  });
});
