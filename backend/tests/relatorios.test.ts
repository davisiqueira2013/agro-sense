import { beforeEach, describe, expect, it } from 'vitest';
import { api, criarLeitor, dia, entrar, prisma, reiniciarBanco, USUARIOS } from './helpers.js';

beforeEach(reiniciarBanco);

/** Lê o corpo binário da resposta (PDF) como Buffer. */
const binario = (r: import('supertest').Test) =>
  r.buffer(true).parse((res, callback) => {
    const partes: Buffer[] = [];
    res.on('data', (parte: Buffer) => partes.push(parte));
    res.on('end', () => callback(null, Buffer.concat(partes)));
  });

describe('RN12 — relatórios em PDF gerados no servidor', () => {
  it.each(['CUSTOS', 'ATIVIDADES', 'ESTOQUE'] as const)('CT-47 gera relatório de %s e grava um PDF válido no banco', async (tipo) => {
    const ana = await entrar(USUARIOS.ana);
    const r = await api().post('/api/relatorios').set(ana).send({ tipo, inicio: dia(-180), fim: dia(0) });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ tipo, geradoPor: { nome: 'Ana Ferreira' } });
    expect(r.body.arquivo).toMatch(new RegExp(`^relatorio-${tipo.toLowerCase()}-.*\\.pdf$`));
    const gravado = await prisma.relatorio.findUniqueOrThrow({ where: { id: r.body.id } });
    expect(Buffer.from(gravado.conteudo).subarray(0, 5).toString()).toBe('%PDF-');
    expect(gravado.tamanhoBytes).toBe(gravado.conteudo.length);
  });

  it('CT-48 download devolve o arquivo PDF com cabeçalhos corretos', async () => {
    const admin = await entrar(USUARIOS.admin);
    const { body: relatorio } = await api().post('/api/relatorios').set(admin).send({ tipo: 'CUSTOS', inicio: dia(-90), fim: dia(0) });
    const r = await binario(api().get(`/api/relatorios/${relatorio.id}/pdf`).set(admin));
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toBe('application/pdf');
    expect(r.headers['content-disposition']).toContain(relatorio.arquivo);
    expect((r.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
    expect((r.body as Buffer).length).toBe(relatorio.tamanhoBytes);
  });

  it('CT-49 data final antes da inicial é recusada (422)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/relatorios').set(admin).send({ tipo: 'CUSTOS', inicio: dia(0), fim: dia(-10) });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('PERIODO_INVALIDO');
  });

  it('CT-50 período maior que 366 dias é recusado (422)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/relatorios').set(admin).send({ tipo: 'ATIVIDADES', inicio: dia(-400), fim: dia(0) });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('PERIODO_LONGO');
  });

  it('CT-51 tipo ou data inválidos são recusados com erro no campo (400)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/relatorios').set(admin).send({ tipo: 'FINANCEIRO', inicio: '01/10/2026', fim: dia(0) });
    expect(r.status).toBe(400);
    const campos = r.body.detalhes.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['tipo', 'inicio']));
  });

  it('CT-52 LEITOR lista e baixa, mas não gera relatório (403)', async () => {
    const leitor = await criarLeitor();
    const lista = await api().get('/api/relatorios').set(leitor);
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(0);
    await binario(api().get(`/api/relatorios/${lista.body[0].id}/pdf`).set(leitor)).expect(200);
    const r = await api().post('/api/relatorios').set(leitor).send({ tipo: 'CUSTOS', inicio: dia(-30), fim: dia(0) });
    expect(r.status).toBe(403);
  });

  it('CT-53 a listagem não traz o conteúdo binário do PDF', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/relatorios').set(admin);
    for (const relatorio of r.body) expect(relatorio).not.toHaveProperty('conteudo');
  });

  it('CT-54 só o ADMIN exclui relatório; depois disso o download responde 404', async () => {
    const ana = await entrar(USUARIOS.ana);
    const admin = await entrar(USUARIOS.admin);
    const { body: relatorio } = await api().post('/api/relatorios').set(ana).send({ tipo: 'ESTOQUE', inicio: dia(-30), fim: dia(0) });
    await api().delete(`/api/relatorios/${relatorio.id}`).set(ana).expect(403);
    await api().delete(`/api/relatorios/${relatorio.id}`).set(admin).expect(204);
    const r = await api().get(`/api/relatorios/${relatorio.id}/pdf`).set(admin);
    expect(r.status).toBe(404);
    expect(r.body.codigo).toBe('RELATORIO_NAO_ENCONTRADO');
  });
});
