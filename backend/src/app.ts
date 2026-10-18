import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi.js';
import { prisma } from './lib/prisma.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

// Monta a aplicação Express: middlewares globais, documentação e rotas.
// Os módulos (auth, talhões, atividades...) são registrados sob /api.
export function criarApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
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

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
