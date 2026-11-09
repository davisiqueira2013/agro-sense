import { beforeEach, describe, expect, it } from 'vitest';
import { api, dia, entrar, prisma, reiniciarBanco, talhaoPorNome, USUARIOS, usuarioPorEmail } from './helpers.js';

beforeEach(reiniciarBanco);

describe('RN03 — talhões', () => {
  it('CT-11 cadastra talhão válido (201)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/talhoes').set(admin).send({ nome: 'Talhão G7', municipio: 'Apucarana', uf: 'pr', cultura: 'Feijão', areaHa: '14,7' });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ nome: 'Talhão G7', uf: 'PR', areaHa: 14.7, status: 'EM_PREPARO' });
  });

  it('CT-12 nome de talhão repetido é recusado (409)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/talhoes').set(admin).send({ nome: 'Talhão A1', municipio: 'Londrina', uf: 'PR', cultura: 'Soja', areaHa: 10 });
    expect(r.status).toBe(409);
    expect(r.body.codigo).toBe('TALHAO_DUPLICADO');
  });

  it('CT-13 área zero é recusada com erro no campo (400)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/talhoes').set(admin).send({ nome: 'Talhão H8', municipio: 'Londrina', uf: 'PR', cultura: 'Soja', areaHa: 0 });
    expect(r.status).toBe(400);
    expect(r.body.detalhes).toContainEqual({ campo: 'areaHa', mensagem: 'A área deve ser maior que zero' });
  });

  it('CT-14 talhão com atividades não pode ser excluído (409)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const a1 = await talhaoPorNome('Talhão A1');
    const r = await api().delete(`/api/talhoes/${a1.id}`).set(admin);
    expect(r.status).toBe(409);
    expect(r.body.codigo).toBe('TALHAO_COM_ATIVIDADES');
  });

  it('CT-15 talhão sem atividades é excluído (204)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const novo = await api().post('/api/talhoes').set(admin).send({ nome: 'Talhão Temporário', municipio: 'Londrina', uf: 'PR', cultura: 'Soja', areaHa: 5 });
    await api().delete(`/api/talhoes/${novo.body.id}`).set(admin).expect(204);
    await api().get(`/api/talhoes/${novo.body.id}`).set(admin).expect(404);
  });
});

describe('RN04 — ciclo da atividade', () => {
  it('CT-16 atividade com data passada e não concluída aparece como ATRASADA', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/atividades?situacao=ATRASADA').set(admin);
    expect(r.status).toBe(200);
    expect(r.body.length).toBeGreaterThan(0);
    for (const a of r.body) {
      expect(a.status).not.toBe('CONCLUIDA');
      expect(new Date(a.dataPrevista).getTime()).toBeLessThan(new Date(`${dia(0)}T00:00:00`).getTime());
    }
  });

  it('CT-17 iniciar e concluir grava a data de conclusão', async () => {
    const admin = await entrar(USUARIOS.admin);
    const e5 = await talhaoPorNome('Talhão E5');
    const atividade = await prisma.atividade.findFirstOrThrow({ where: { talhaoId: e5.id, status: 'AGENDADA' } });
    const iniciada = await api().patch(`/api/atividades/${atividade.id}/status`).set(admin).send({ status: 'EM_ANDAMENTO' });
    expect(iniciada.body.situacao).toBe('EM_ANDAMENTO');
    const concluida = await api().patch(`/api/atividades/${atividade.id}/status`).set(admin).send({ status: 'CONCLUIDA' });
    expect(concluida.status).toBe(200);
    expect(concluida.body.situacao).toBe('CONCLUIDA');
    expect(concluida.body.dataConclusao).not.toBeNull();
  });

  it('CT-18 iniciar uma atividade já em andamento é recusado (422)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const atividade = await prisma.atividade.findFirstOrThrow({ where: { status: 'EM_ANDAMENTO' } });
    const r = await api().patch(`/api/atividades/${atividade.id}/status`).set(admin).send({ status: 'EM_ANDAMENTO' });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('TRANSICAO_INVALIDA');
  });

  it('CT-19 atividade concluída não pode ser editada nem mudar de status (422)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const atividade = await prisma.atividade.findFirstOrThrow({ where: { status: 'CONCLUIDA' } });
    const edicao = await api().put(`/api/atividades/${atividade.id}`).set(admin).send({ observacao: 'tentativa' });
    expect(edicao.status).toBe(422);
    expect(edicao.body.codigo).toBe('ATIVIDADE_CONCLUIDA');
    const status = await api().patch(`/api/atividades/${atividade.id}/status`).set(admin).send({ status: 'EM_ANDAMENTO' });
    expect(status.status).toBe(422);
  });
});

describe('RN05 — pulverização x vento forte', () => {
  it('CT-20 agendar pulverização em talhão com alerta de vento forte é bloqueado (409)', async () => {
    const ana = await entrar(USUARIOS.ana);
    const a1 = await talhaoPorNome('Talhão A1'); // tem alerta de vento forte hoje
    const responsavel = await usuarioPorEmail(USUARIOS.carlos);
    const r = await api().post('/api/atividades').set(ana).send({ tipo: 'PULVERIZACAO', talhaoId: a1.id, responsavelId: responsavel.id, dataPrevista: dia(0) });
    expect(r.status).toBe(409);
    expect(r.body.codigo).toBe('PULVERIZACAO_BLOQUEADA_VENTO');
  });

  it('CT-21 a mesma pulverização em talhão sem alerta de vento é aceita (201)', async () => {
    const ana = await entrar(USUARIOS.ana);
    const e5 = await talhaoPorNome('Talhão E5');
    const responsavel = await usuarioPorEmail(USUARIOS.carlos);
    const r = await api().post('/api/atividades').set(ana).send({ tipo: 'PULVERIZACAO', talhaoId: e5.id, responsavelId: responsavel.id, dataPrevista: dia(0) });
    expect(r.status).toBe(201);
    expect(r.body.situacao).toBe('AGENDADA');
  });

  it('CT-22 iniciar hoje uma pulverização em talhão com vento forte é bloqueado (409)', async () => {
    const ana = await entrar(USUARIOS.ana);
    const a1 = await talhaoPorNome('Talhão A1');
    const responsavel = await usuarioPorEmail(USUARIOS.carlos);
    // Agendada para depois do fim do alerta: o agendamento passa...
    const criada = await api().post('/api/atividades').set(ana).send({ tipo: 'PULVERIZACAO', talhaoId: a1.id, responsavelId: responsavel.id, dataPrevista: dia(5) });
    expect(criada.status).toBe(201);
    // ...mas iniciar hoje, com o alerta ativo, não.
    const r = await api().patch(`/api/atividades/${criada.body.id}/status`).set(ana).send({ status: 'EM_ANDAMENTO' });
    expect(r.status).toBe(409);
    expect(r.body.codigo).toBe('PULVERIZACAO_BLOQUEADA_VENTO');
  });

  it('CT-23 depois de encerrar o alerta de vento, a pulverização é liberada', async () => {
    const ana = await entrar(USUARIOS.ana);
    const a1 = await talhaoPorNome('Talhão A1');
    const alerta = await prisma.alertaClimatico.findFirstOrThrow({ where: { tipo: 'VENTO_FORTE', ativo: true, talhoes: { some: { id: a1.id } } } });
    await api().patch(`/api/alertas/${alerta.id}/encerrar`).set(ana).expect(200);
    const responsavel = await usuarioPorEmail(USUARIOS.carlos);
    const r = await api().post('/api/atividades').set(ana).send({ tipo: 'PULVERIZACAO', talhaoId: a1.id, responsavelId: responsavel.id, dataPrevista: dia(0) });
    expect(r.status).toBe(201);
  });
});
