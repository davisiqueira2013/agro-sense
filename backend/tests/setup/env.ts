// Carrega o .env.test antes de qualquer import da API (o Prisma lê DATABASE_URL ao ser importado).
process.loadEnvFile(new URL('../../.env.test', import.meta.url));
