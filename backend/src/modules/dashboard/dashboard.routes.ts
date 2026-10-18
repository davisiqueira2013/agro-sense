import { Router } from 'express';
import { z } from 'zod';
import { autenticar } from '../../middlewares/autenticar.js';
import * as dashboardService from './dashboard.service.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(autenticar);

/** GET /api/dashboard/resumo — cards e alertas rápidos (RN08). */
dashboardRoutes.get('/resumo', async (_req, res) => {
  res.json(await dashboardService.resumo());
});

/** GET /api/dashboard/custos?meses=6 — gráfico de custos por categoria (RN08). */
dashboardRoutes.get('/custos', async (req, res) => {
  const { meses } = z.object({ meses: z.coerce.number().int().min(1).max(24).default(6) }).parse(req.query);
  res.json(await dashboardService.custos(meses));
});
