import jwt from 'jsonwebtoken';
import { beforeAll, describe, expect, it } from 'vitest';
import { api, criarLeitor, entrar, reiniciarBanco, SENHA, USUARIOS, usuarioPorEmail } from './helpers.js';

beforeAll(reiniciarBanco);

describe('RN01 — autenticação', () => {
  it('CT-01 login com credenciais válidas devolve token JWT e dados do usuário', async () => {
    const r = await api().post('/api/auth/login').send({ email: USUARIOS.admin, senha: SENHA });
    expect(r.status).toBe(200);
    expect(r.body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(r.body.usuario).toMatchObject({ email: USUARIOS.admin, perfil: 'ADMIN' });
    expect(r.body.usuario).not.toHaveProperty('senhaHash');
  });

  it('CT-02 senha errada é recusada com 401', async () => {
    const r = await api().post('/api/auth/login').send({ email: USUARIOS.admin, senha: 'senha-errada' });
    expect(r.status).toBe(401);
    expect(r.body.codigo).toBe('CREDENCIAIS_INVALIDAS');
  });

  it('CT-03 usuário inativo não consegue entrar (403)', async () => {
    const r = await api().post('/api/auth/login').send({ email: USUARIOS.jose, senha: SENHA });
    expect(r.status).toBe(403);
    expect(r.body.codigo).toBe('USUARIO_INATIVO');
  });

  it('CT-04 rota protegida sem token responde 401', async () => {
    const r = await api().get('/api/talhoes');
    expect(r.status).toBe(401);
    expect(r.body.codigo).toBe('TOKEN_AUSENTE');
  });

  it('CT-05 token adulterado responde 401', async () => {
    const r = await api().get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    expect(r.status).toBe(401);
    expect(r.body.codigo).toBe('TOKEN_INVALIDO');
  });

  it('CT-06 token expirado responde 401 com código próprio', async () => {
    const admin = await usuarioPorEmail(USUARIOS.admin);
    const expirado = jwt.sign({ nome: admin.nome, perfil: admin.perfil }, process.env.JWT_SECRET!, { subject: String(admin.id), expiresIn: -10 });
    const r = await api().get('/api/auth/me').set('Authorization', `Bearer ${expirado}`);
    expect(r.status).toBe(401);
    expect(r.body.codigo).toBe('TOKEN_EXPIRADO');
  });

  it('CT-07 a senha é guardada como hash bcrypt, nunca em texto', async () => {
    const admin = await usuarioPorEmail(USUARIOS.admin);
    expect(admin.senhaHash).not.toBe(SENHA);
    expect(admin.senhaHash).toMatch(/^\$2[aby]\$/);
  });
});

describe('RN02 — perfis de acesso', () => {
  it('CT-08 LEITOR consulta dados, mas não cadastra talhão (403)', async () => {
    const leitor = await criarLeitor();
    await api().get('/api/talhoes').set(leitor).expect(200);
    const r = await api().post('/api/talhoes').set(leitor).send({ nome: 'Talhão Z9', municipio: 'Londrina', uf: 'PR', cultura: 'Soja', areaHa: 10 });
    expect(r.status).toBe(403);
    expect(r.body.codigo).toBe('SEM_PERMISSAO');
  });

  it('CT-09 TECNICO cadastra talhão, mas não exclui (exclusão só ADMIN)', async () => {
    const tecnico = await entrar(USUARIOS.ana);
    const criado = await api().post('/api/talhoes').set(tecnico).send({ nome: 'Talhão T1', municipio: 'Toledo', uf: 'PR', cultura: 'Milho', areaHa: 12.5 });
    expect(criado.status).toBe(201);
    const r = await api().delete(`/api/talhoes/${criado.body.id}`).set(tecnico);
    expect(r.status).toBe(403);
  });

  it('CT-10 TECNICO não acessa a gestão de usuários (403)', async () => {
    const tecnico = await entrar(USUARIOS.ana);
    await api().get('/api/usuarios').set(tecnico).expect(403);
  });
});
