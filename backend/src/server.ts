import './lib/env.js'; // confere as variáveis obrigatórias antes de subir
import { criarApp } from './app.js';
import { prisma } from './lib/prisma.js';

const porta = Number(process.env.PORT ?? 3333);

const servidor = criarApp().listen(porta, () => {
  console.log(`API do Agro Sense rodando em http://localhost:${porta}/api`);
  console.log(`Documentação (Swagger): http://localhost:${porta}/api/docs`);
});

// Encerra conexões com o banco ao parar a API (Ctrl+C).
const encerrar = () => servidor.close(() => prisma.$disconnect().finally(() => process.exit(0)));
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
