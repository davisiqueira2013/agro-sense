import { beforeEach, describe, expect, it } from 'vitest';
import { api, entrar, prisma, reiniciarBanco, SENHA, USUARIOS, usuarioPorEmail } from './helpers.js';

beforeEach(reiniciarBanco);

describe('RN10 — autoria do diário de campo', () => {
  it('CT-39 o autor do registro é sempre o usuário do token, mesmo se outro for enviado', async () => {
    const carlos = await entrar(USUARIOS.carlos);
    const admin = await usuarioPorEmail(USUARIOS.admin);
    const r = await api().post('/api/diario').set(carlos).send({ titulo: 'Ferrugem nas folhas', texto: 'Pontos de ferrugem no terço inferior.', categoria: 'DOENCAS', autorId: admin.id });
    expect(r.status).toBe(201);
    expect(r.body.autor.nome).toBe('Carlos Mendes');
  });

  it('CT-40 técnico não altera registro de outro autor (403)', async () => {
    const carlos = await entrar(USUARIOS.carlos);
    const daAna = await prisma.registroDiario.findFirstOrThrow({ where: { autor: { email: USUARIOS.ana } } });
    const r = await api().put(`/api/diario/${daAna.id}`).set(carlos).send({ titulo: 'Alterado', texto: 'Texto alterado por outro.', categoria: 'GERAL' });
    expect(r.status).toBe(403);
    expect(r.body.codigo).toBe('SEM_PERMISSAO_REGISTRO');
  });

  it('CT-41 o autor e o administrador podem alterar o registro', async () => {
    const ana = await entrar(USUARIOS.ana);
    const admin = await entrar(USUARIOS.admin);
    const daAna = await prisma.registroDiario.findFirstOrThrow({ where: { autor: { email: USUARIOS.ana } } });
    await api().put(`/api/diario/${daAna.id}`).set(ana).send({ titulo: 'Revisado pela autora', texto: 'Texto revisado pela autora.', categoria: 'PRAGAS' }).expect(200);
    await api().put(`/api/diario/${daAna.id}`).set(admin).send({ titulo: 'Revisado pelo admin', texto: 'Texto revisado pelo admin.', categoria: 'PRAGAS' }).expect(200);
  });
});

describe('RN11 — gestão de usuários', () => {
  it('CT-42 e-mail repetido é recusado (409)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/usuarios').set(admin).send({ nome: 'Outra Ana', email: USUARIOS.ana, cargo: 'Agrônoma', perfil: 'TECNICO', senha: SENHA });
    expect(r.status).toBe(409);
    expect(r.body.codigo).toBe('EMAIL_DUPLICADO');
  });

  it('CT-43 senha com menos de 8 caracteres é recusada (400)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().post('/api/usuarios').set(admin).send({ nome: 'Novo Usuário', email: 'novo@agrosense.com.br', cargo: 'Operador', perfil: 'TECNICO', senha: '1234567' });
    expect(r.status).toBe(400);
    expect(r.body.detalhes).toContainEqual({ campo: 'senha', mensagem: 'A senha deve ter no mínimo 8 caracteres' });
  });

  it('CT-44 o administrador não pode desativar a própria conta (422)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const eu = await usuarioPorEmail(USUARIOS.admin);
    const r = await api().patch(`/api/usuarios/${eu.id}/status`).set(admin).send({ ativo: false });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('AUTO_DESATIVACAO');
  });

  it('CT-45 usuário desativado perde o acesso na hora, mesmo com token válido (401)', async () => {
    const admin = await entrar(USUARIOS.admin);
    const carlos = await entrar(USUARIOS.carlos);
    await api().get('/api/talhoes').set(carlos).expect(200);
    const usuario = await usuarioPorEmail(USUARIOS.carlos);
    await api().patch(`/api/usuarios/${usuario.id}/status`).set(admin).send({ ativo: false }).expect(200);
    const r = await api().get('/api/talhoes').set(carlos);
    expect(r.status).toBe(401);
    expect(r.body.codigo).toBe('USUARIO_SEM_ACESSO');
  });

  it('CT-46 a listagem de usuários nunca devolve a senha', async () => {
    const admin = await entrar(USUARIOS.admin);
    const r = await api().get('/api/usuarios').set(admin);
    expect(r.status).toBe(200);
    for (const u of r.body) expect(u).not.toHaveProperty('senhaHash');
  });
});
