// Popula o banco com os mesmos dados fictícios que o protótipo exibia.
// Executar: npm run db:seed   (apaga e recria todos os registros)
//
// As datas são relativas ao dia em que o seed roda, para que "hoje",
// "atrasado" e o gráfico dos últimos 6 meses façam sentido em qualquer data.

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const SENHA_PADRAO = 'agrosense123';

/** Data a partir de hoje: diasAPartirDeHoje(-3) = três dias atrás, às 8h. */
function dia(diasAPartirDeHoje: number, hora = 8) {
  const data = new Date();
  data.setDate(data.getDate() + diasAPartirDeHoje);
  data.setHours(hora, 0, 0, 0);
  return data;
}

/** Dia 10 do mês, N meses atrás (0 = mês atual). */
function mesAtras(meses: number, diaDoMes = 10) {
  const data = new Date();
  data.setMonth(data.getMonth() - meses, diaDoMes);
  data.setHours(9, 0, 0, 0);
  return data;
}

async function limpar() {
  // Ordem inversa das dependências (filhos antes dos pais).
  await prisma.movimentacao.deleteMany();
  await prisma.relatorio.deleteMany();
  await prisma.registroDiario.deleteMany();
  await prisma.atividade.deleteMany();
  await prisma.alertaClimatico.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.talhao.deleteMany();
  await prisma.usuario.deleteMany();
}

async function main() {
  await limpar();
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  // ---------- Usuários ----------
  const [rodrigo, ana, carlos, jose] = await Promise.all([
    prisma.usuario.create({ data: { nome: 'Rodrigo Figueiredo', email: 'rodrigo@agrosense.com.br', cargo: 'Administrador', perfil: 'ADMIN', senhaHash } }),
    prisma.usuario.create({ data: { nome: 'Ana Ferreira', email: 'ana.agronoma@agrosense.com.br', cargo: 'Engenheira Agrônoma', perfil: 'TECNICO', senhaHash } }),
    prisma.usuario.create({ data: { nome: 'Carlos Mendes', email: 'carlos.op@agrosense.com.br', cargo: 'Operador de Máquinas', perfil: 'TECNICO', senhaHash } }),
    prisma.usuario.create({ data: { nome: 'José Silva', email: 'jose.silva@agrosense.com.br', cargo: 'Consultor Externo', perfil: 'LEITOR', ativo: false, senhaHash } }),
  ]);

  // ---------- Talhões (municípios do Paraná) ----------
  const talhao = async (
    nome: string, municipio: string, latitude: number, longitude: number,
    cultura: string, areaHa: number, status: 'ATIVO' | 'EM_PREPARO' | 'COLHIDO',
    temperaturaAtual: number, umidadeAtual: number,
  ) =>
    prisma.talhao.create({
      data: { nome, municipio, uf: 'PR', latitude, longitude, cultura, areaHa, status, temperaturaAtual, umidadeAtual, climaAtualizadoEm: dia(0, 7) },
    });

  const a1 = await talhao('Talhão A1', 'Londrina', -23.3045, -51.1696, 'Soja', 45.2, 'ATIVO', 24, 68);
  const b2 = await talhao('Talhão B2', 'Maringá', -23.4205, -51.9333, 'Milho', 32.8, 'EM_PREPARO', 26, 72);
  const c3 = await talhao('Talhão C3', 'Ponta Grossa', -25.0916, -50.1668, 'Trigo', 28.5, 'ATIVO', 19, 85);
  const d4 = await talhao('Talhão D4', 'Cascavel', -24.9555, -53.4552, 'Soja', 61, 'COLHIDO', 27, 60);
  const e5 = await talhao('Talhão E5', 'Toledo', -24.7246, -53.7412, 'Milho', 38.4, 'EM_PREPARO', 26, 64);
  const f6 = await talhao('Talhão F6', 'Guarapuava', -25.3902, -51.4623, 'Trigo', 52.1, 'ATIVO', 16, 81);

  // ---------- Atividades ----------
  await prisma.atividade.createMany({
    data: [
      { tipo: 'PLANTIO', talhaoId: a1.id, responsavelId: carlos.id, dataPrevista: dia(-25), status: 'CONCLUIDA', dataConclusao: dia(-25, 17) },
      { tipo: 'PULVERIZACAO', talhaoId: c3.id, responsavelId: ana.id, dataPrevista: dia(0), status: 'EM_ANDAMENTO' },
      // Data prevista já passou e não foi concluída → a API mostra como "atrasada".
      { tipo: 'COLHEITA', talhaoId: b2.id, responsavelId: jose.id, dataPrevista: dia(-2), status: 'AGENDADA' },
      { tipo: 'ADUBACAO', talhaoId: e5.id, responsavelId: carlos.id, dataPrevista: dia(2), status: 'AGENDADA' },
      { tipo: 'IRRIGACAO', talhaoId: f6.id, responsavelId: carlos.id, dataPrevista: dia(5), status: 'AGENDADA', observacao: 'Conferir pressão do pivô antes de iniciar.' },
      { tipo: 'COLHEITA', talhaoId: d4.id, responsavelId: carlos.id, dataPrevista: dia(-40), status: 'CONCLUIDA', dataConclusao: dia(-39, 16) },
    ],
  });

  // ---------- Diário de campo ----------
  await prisma.registroDiario.createMany({
    data: [
      {
        titulo: 'Identificação de praga inicial', categoria: 'PRAGAS', autorId: ana.id, talhaoId: a1.id, data: dia(0, 10),
        texto: 'Encontrado foco inicial de mosca-branca nas bordaduras do Talhão A1. Recomendada aplicação direcionada nos próximos 2 dias.',
      },
      {
        titulo: 'Condições do solo pós-chuva', categoria: 'SOLO', autorId: carlos.id, talhaoId: c3.id, data: dia(-2, 15),
        texto: 'Avaliamos a umidade do solo no Talhão C3. Solo em capacidade de campo excelente para entrada de maquinário pesado.',
      },
    ],
  });

  // ---------- Insumos e movimentações ----------
  // Para cada insumo: entradas nos últimos 6 meses e saídas que levam ao saldo final.
  // O saldo gravado no insumo é sempre a soma das movimentações (regra RN06).
  const insumos = [
    { nome: 'Semente de Soja (XP-45)', categoria: 'SEMENTES', unidade: 'kg', estoqueMinimo: 300, custoUnitario: 6.5, saldo: 1200, entradas: [0, 0, 800, 0, 600, 400] },
    { nome: 'Fertilizante NPK 10-10-10', categoria: 'FERTILIZANTES', unidade: 'kg', estoqueMinimo: 400, custoUnitario: 4.2, saldo: 250, entradas: [1500, 0, 1200, 0, 1000, 0] },
    { nome: 'Fungicida ABC', categoria: 'DEFENSIVOS', unidade: 'L', estoqueMinimo: 40, custoUnitario: 98, saldo: 45, entradas: [40, 30, 0, 50, 0, 20] },
    { nome: 'Herbicida Glifosato', categoria: 'DEFENSIVOS', unidade: 'L', estoqueMinimo: 60, custoUnitario: 32, saldo: 52, entradas: [80, 0, 60, 0, 40, 0] },
    { nome: 'Semente de Milho (AG-8088)', categoria: 'SEMENTES', unidade: 'kg', estoqueMinimo: 200, custoUnitario: 18, saldo: 640, entradas: [0, 300, 0, 400, 0, 200] },
    { nome: 'Óleo Diesel S10', categoria: 'COMBUSTIVEL', unidade: 'L', estoqueMinimo: 1000, custoUnitario: 6.1, saldo: 3500, entradas: [1500, 1200, 1800, 1400, 1600, 1000] },
  ] as const;

  for (const item of insumos) {
    const insumo = await prisma.insumo.create({
      data: {
        nome: item.nome, categoria: item.categoria, unidade: item.unidade,
        estoqueMinimo: item.estoqueMinimo, custoUnitario: item.custoUnitario, quantidade: item.saldo,
      },
    });

    // entradas[0] = 5 meses atrás ... entradas[5] = mês atual
    const totalEntradas = item.entradas.reduce((soma, qtd) => soma + qtd, 0);
    const totalSaidas = totalEntradas - item.saldo;
    const mesesComEntrada = item.entradas.filter((qtd) => qtd > 0).length;

    for (const [indice, quantidade] of item.entradas.entries()) {
      if (quantidade === 0) continue;
      const meses = 5 - indice;
      await prisma.movimentacao.create({
        data: { tipo: 'ENTRADA', quantidade, custoUnitario: item.custoUnitario, data: mesAtras(meses, 5), insumoId: insumo.id, usuarioId: rodrigo.id },
      });
      // Consumo distribuído ao longo dos meses em que houve compra.
      await prisma.movimentacao.create({
        data: { tipo: 'SAIDA', quantidade: totalSaidas / mesesComEntrada, custoUnitario: item.custoUnitario, data: mesAtras(meses, 20), insumoId: insumo.id, usuarioId: carlos.id },
      });
    }
  }

  // ---------- Alertas climáticos ----------
  await prisma.alertaClimatico.create({
    data: {
      tipo: 'GEADA', severidade: 'CRITICO', origem: 'MANUAL', titulo: 'Risco de Geada Extrema', inicio: dia(0, 0), fim: dia(2, 0),
      descricao: 'Previsão de temperatura abaixo de 2°C para as próximas 48 horas.',
      talhoes: { connect: [{ id: b2.id }, { id: f6.id }] },
    },
  });
  await prisma.alertaClimatico.create({
    data: {
      tipo: 'CHUVA_INTENSA', severidade: 'ATENCAO', titulo: 'Chuva Intensa', inicio: dia(0, 0), fim: dia(1, 0),
      descricao: 'Acumulado previsto de 80mm em 24h. Risco de erosão em áreas preparadas.',
      talhoes: { connect: [a1, b2, c3, d4, e5, f6].map((t) => ({ id: t.id })) },
    },
  });
  await prisma.alertaClimatico.create({
    data: {
      tipo: 'VENTO_FORTE', severidade: 'AVISO', titulo: 'Vento Forte', inicio: dia(0, 0), fim: dia(1, 0),
      descricao: 'Rajadas acima de 40km/h. Suspender pulverizações agendadas.',
      talhoes: { connect: [{ id: a1.id }, { id: c3.id }] },
    },
  });

  const contagem = {
    usuarios: await prisma.usuario.count(),
    talhoes: await prisma.talhao.count(),
    atividades: await prisma.atividade.count(),
    registros: await prisma.registroDiario.count(),
    insumos: await prisma.insumo.count(),
    movimentacoes: await prisma.movimentacao.count(),
    alertas: await prisma.alertaClimatico.count(),
  };
  console.log('Seed concluído:', contagem);
  console.log(`Login de teste: rodrigo@agrosense.com.br / ${SENHA_PADRAO} (mesma senha para todos os usuários)`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
