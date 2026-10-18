import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Configuração do Prisma CLI (migrations, seed e geração do cliente).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Lido do arquivo .env. O valor padrão é o banco do docker-compose.yml.
    url: process.env.DATABASE_URL ?? 'postgresql://agrosense:agrosense@localhost:5432/agrosense?schema=public',
  },
});
