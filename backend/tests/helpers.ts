import request from 'supertest';
import { popular } from '../prisma/seed.js';
import { criarApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

export const app = criarApp();
export const api = () => request(app);
export { prisma };

export const SENHA = 'agrosense123';
export const USUARIOS = {
  admin: 'rodrigo@agrosense.com.br', // ADMIN
  ana: 'ana.agronoma@agrosense.com.br', // TECNICO
  carlos: 'carlos.op@agrosense.com.br', // TECNICO
  jose: 'jose.silva@agrosense.com.br', // LEITOR, inativo
} as const;

/** Volta o banco de teste aos dados de exemplo do seed. */
export const reiniciarBanco = () => popular();

/** Faz login e devolve o cabeçalho Authorization pronto. */
export async function entrar(email: string, senha = SENHA) {
  const resposta = await api().post('/api/auth/login').send({ email, senha });
  if (resposta.status !== 200) throw new Error(`Login de ${email} falhou: ${resposta.status} ${JSON.stringify(resposta.body)}`);
  return { Authorization: `Bearer ${resposta.body.token}` };
}

/** Cria (via API, como ADMIN) um usuário LEITOR ativo e devolve o cabeçalho dele. */
export async function criarLeitor() {
  const admin = await entrar(USUARIOS.admin);
  const email = `leitor.${Date.now()}@agrosense.com.br`;
  await api().post('/api/usuarios').set(admin).send({ nome: 'Leitor de Teste', email, cargo: 'Consultor', perfil: 'LEITOR', senha: SENHA }).expect(201);
  return entrar(email);
}

/** Data do calendário (AAAA-MM-DD) a N dias de hoje. */
export function dia(deslocamento = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamento);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const talhaoPorNome = (nome: string) => prisma.talhao.findUniqueOrThrow({ where: { nome } });
export const insumoPorNome = (nome: string) => prisma.insumo.findUniqueOrThrow({ where: { nome } });
export const usuarioPorEmail = (email: string) => prisma.usuario.findUniqueOrThrow({ where: { email } });
