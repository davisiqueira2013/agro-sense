import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Instância única do Prisma usada por toda a API.
// O Prisma 7 conversa com o PostgreSQL pelo driver "pg" (adapter).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
