import cors from 'cors';
import express from 'express';

// Monta a aplicação Express: middlewares globais e rotas.
// Os módulos (auth, talhões, atividades...) serão registrados aqui
// nas próximas etapas, sempre sob o prefixo /api.
export function criarApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json());

  // Verificação simples de que a API está no ar.
  // Na etapa 3 passa a conferir também a conexão com o banco.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', servico: 'agro-sense-api', horario: new Date().toISOString() });
  });

  // Rota inexistente → 404 no formato padrão de erro da API.
  app.use((_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada', codigo: 'NAO_ENCONTRADO' });
  });

  return app;
}
