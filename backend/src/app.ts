import { existsSync } from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi.js';
import { prisma } from './lib/prisma.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { alertasRoutes } from './modules/alertas/alertas.routes.js';
import { atividadesRoutes } from './modules/atividades/atividades.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { diarioRoutes } from './modules/diario/diario.routes.js';
import { insumosRoutes } from './modules/insumos/insumos.routes.js';
import { relatoriosRoutes } from './modules/relatorios/relatorios.routes.js';
import { talhoesRoutes } from './modules/talhoes/talhoes.routes.js';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes.js';

// Monta a aplicação Express: middlewares globais, documentação e rotas.
// Os módulos (auth, talhões, atividades...) são registrados sob /api.
export function criarApp() {
  const app = express();

  // CORS_ORIGIN aceita uma ou mais origens separadas por vírgula.
  // Um host sem protocolo (ex.: agro-sense.onrender.com) vira https://host.
  const origens = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean)
    .map((origem) => (/^https?:\/\//.test(origem) ? origem : `https://${origem}`));
  app.use(cors({ origin: origens }));
  app.use(express.json());

  // Página inicial da API: identifica o serviço e aponta para a documentação.
  app.get('/api', (_req, res) => {
    res.json({
      nome: 'Agro Sense API',
      versao: openapi.info.version,
      documentacao: '/api/docs',
      especificacao: '/api/docs.json',
      status: '/api/health',
    });
  });

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
  app.use('/api/talhoes', talhoesRoutes);
  app.use('/api/atividades', atividadesRoutes);
  app.use('/api/insumos', insumosRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/alertas', alertasRoutes);
  app.use('/api/diario', diarioRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/relatorios', relatoriosRoutes);

  // Rota da API inexistente: sempre 404 em JSON, mesmo quando o frontend é servido junto.
  app.use('/api', rotaNaoEncontrada);

  // Publicação: com FRONTEND_DIST definido, a própria API entrega o site (build do Vite).
  // Frontend e API ficam no mesmo endereço, então não há CORS nem URL da API para configurar.
  const pastaFrontend = process.env.FRONTEND_DIST ? path.resolve(process.env.FRONTEND_DIST) : null;
  if (pastaFrontend && existsSync(path.join(pastaFrontend, 'index.html'))) {
    app.use(express.static(pastaFrontend, { index: false, maxAge: '1h' }));
    // Qualquer outro GET devolve o index.html (aplicação de página única).
    app.get(/.*/, (_req, res) => res.sendFile(path.join(pastaFrontend, 'index.html')));
  }

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
