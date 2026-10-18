import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { autenticar } from '../../middlewares/autenticar.js';

// Módulo de usuários. Por enquanto só a lista de responsáveis;
// o cadastro completo (ADMIN) entra na etapa do módulo Usuários.
export const usuariosRoutes = Router();

usuariosRoutes.use(autenticar);

/** GET /api/usuarios/responsaveis — usuários ativos, para os campos de seleção. */
usuariosRoutes.get('/responsaveis', async (_req, res) => {
  const responsaveis = await prisma.usuario.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, cargo: true },
    orderBy: { nome: 'asc' },
  });
  res.json(responsaveis);
});
