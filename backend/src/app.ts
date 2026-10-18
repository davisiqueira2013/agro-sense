import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi.js';
import { prisma } from './lib/prisma.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { authRoutes } from './modules/auth/auth.routes.js';

// Monta a aplicação Express: middlewares globais, documentação e rotas.
// Os módulos (auth, talhões, atividades...) são registrados sob /api.
export function criarApp() {
  const app = express();

  // CORS_ORIGIN aceita uma ou mais origens separadas por vírgula.
  const origens = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((origem) => origem.trim());
  app.use(cors({ origin: origens }));
  app.use(express.json());

  // Documentação navegável da API.
  app.get('/api/docs.json', (_req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Agro Sense API' }));

  // Confere se a API está no ar e se o banco responde.
  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', servico: 'agro-sense-api', banco: 'conectado', horario: new Date().toISOString() });
    } catch {
      res.status(503).json({ erro: 'Banco de dados indisponível', codigo: 'BANCO_INDISPONIVEL' });
    }
  });

  // Módulos da API.
  app.use('/api/auth', authRoutes);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
