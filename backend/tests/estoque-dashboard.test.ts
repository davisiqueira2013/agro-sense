import { beforeEach, describe, expect, it } from 'vitest';
import { api, entrar, insumoPorNome, prisma, reiniciarBanco, USUARIOS } from './helpers.js';

beforeEach(reiniciarBanco);

describe('RN06 — movimentação de estoque', () => {
  it('CT-24 saída maior que o saldo é recusada e o saldo não muda (422)', async () => {
    const ana = await entrar(USUARIOS.ana);
    const npk = await insumoPorNome('Fertilizante NPK 10-10-10'); // saldo 250 kg
    const r = await api().post(`/api/insumos/${npk.id}/movimentacoes`).set(ana).send({ tipo: 'SAIDA', quantidade: 300 });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('SALDO_INSUFICIENTE');
    expect(r.body.detalhes).toEqual({ saldo: 250, solicitado: 300 });
    expect((await insumoPorNome('Fertilizante NPK 10-10-10')).quantidade).toBe(250);
  });

  it('CT-25 entrada soma ao saldo e fica registrada no histórico', async () => {
    const ana = await entrar(USUARIOS.ana);
    const npk = await insumoPorNome('Fertilizante NPK 10-10-10');
    const antes = await prisma.movimentacao.count({ where: { insumoId: npk.id } });
    const r = await api().post(`/api/insumos/${npk.id}/movimentacoes`).set(ana).send({ tipo: 'ENTRADA', quantidade: 100, custoUnitario: 4.5 });
    expect(r.status).toBe(201);
    expect(r.body.quantidade).toBe(350);
    expect(await prisma.movimentacao.count({ where: { insumoId: npk.id } })).toBe(antes + 1);
  });

  it('CT-26 duas saídas simultâneas não deixam o saldo negativo', async () => {
    const ana = await entrar(USUARIOS.ana);
    const fungicida = await insumoPorNome('Fungicida ABC'); // saldo 45 L
    const saida = () => api().post(`/api/insumos/${fungicida.id}/movimentacoes`).set(ana).send({ tipo: 'SAIDA', quantidade: 30 });
    const respostas = await Promise.all([saida(), saida()]);
    expect(respostas.map((r) => r.status).sort()).toEqual([201, 422]);
    expect((await insumoPorNome('Fungicida ABC')).quantidade).toBe(15);
  });

  it('CT-27 a quantidade não pode ser alterada pela edição do insumo', async () => {
    const admin = await entrar(USUARIOS.admin);
    const npk = await insumoPorNome('Fertilizante NPK 10-10-10');
    await api().put(`/api/insumos/${npk.id}`).set(admin).send({ quantidade: 9999 }).expect(200);
    expect((await insumoPorNome('Fertilizante NPK 10-10-10')).quantidade).toBe(250);
  });
});

describe('RN07 — status do insumo', () => {
  it('CT-28 status é calculado pelo estoque mínimo (Baixo, Atenção, Normal)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/insumos').set(admin);
    const status = Object.fromEntries(r.body.map((i: { nome: string; status: string }) => [i.nome, i.status]));
    expect(status['Fertilizante NPK 10-10-10']).toBe('BAIXO'); // 250 ≤ 400
    expect(status['Fungicida ABC']).toBe('ATENCAO'); // 45 ≤ 1,5 × 40
    expect(status['Óleo Diesel S10']).toBe('NORMAL'); // 3500 > 1,5 × 1000

    // Limites exatos, com estoque mínimo de 100: 100 → Baixo, 150 → Atenção, 151 → Normal.
    for (const [quantidadeInicial, esperado] of [[100, 'BAIXO'], [150, 'ATENCAO'], [151, 'NORMAL']] as const) {
      const criado = await api().post('/api/insumos').set(admin).send({
        nome: `Insumo limite ${quantidadeInicial}`, categoria: 'DEFENSIVOS', unidade: 'L', estoqueMinimo: 100, custoUnitario: 10, quantidadeInicial,
      });
      expect(criado.status).toBe(201);
      expect(criado.body.status).toBe(esperado);
    }
  });

  it('CT-29 uma saída que leva ao mínimo muda o status para Baixo', async () => {
    const admin = await entrar(USUARIOS.admin);
    const diesel = await insumoPorNome('Óleo Diesel S10'); // 3500, mínimo 1000
    const r = await api().post(`/api/insumos/${diesel.id}/movimentacoes`).set(admin).send({ tipo: 'SAIDA', quantidade: 2500 });
    expect(r.body.status).toBe('BAIXO');
  });
});

describe('RN08 — indicadores do Dashboard', () => {
  it('CT-30 uma entrada de 100 L a R$ 30 aumenta o "Gasto do mês" em exatamente R$ 3.000', async () => {
    const admin = await entrar(USUARIOS.admin);
    const antes = (await api().get('/api/dashboard/resumo').set(admin)).body.gastoMes.valor;
    const diesel = await insumoPorNome('Óleo Diesel S10');
    await api().post(`/api/insumos/${diesel.id}/movimentacoes`).set(admin).send({ tipo: 'ENTRADA', quantidade: 100, custoUnitario: 30 }).expect(201);
    const depois = (await api().get('/api/dashboard/resumo').set(admin)).body.gastoMes.valor;
    expect(depois - antes).toBeCloseTo(3000, 2);
  });

  it('CT-31 os cards do Dashboard batem com os dados do banco', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/dashboard/resumo').set(admin);
    expect(r.body.talhoes.total).toBe(await prisma.talhao.count());
    expect(r.body.talhoes.ativos).toBe(await prisma.talhao.count({ where: { status: 'ATIVO' } }));
    expect(r.body.insumos.criticos).toBe(2); // NPK e Herbicida abaixo do mínimo
    expect(r.body.atividades.atrasadas).toBe(1);
  });

  it('CT-32 o gráfico de custos devolve um ponto por mês pedido', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/dashboard/custos?meses=6').set(admin);
    expect(r.body).toHaveLength(6);
    for (const mes of r.body) expect(mes.total).toBeCloseTo(mes.SEMENTES + mes.FERTILIZANTES + mes.DEFENSIVOS + mes.COMBUSTIVEL, 2);
  });
});
