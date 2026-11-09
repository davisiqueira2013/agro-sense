import { execSync } from 'node:child_process';
import pg from 'pg';

/**
 * Executado uma vez antes de todos os testes:
 * 1. cria o banco agrosense_test, se ainda não existir;
 * 2. aplica as migrations nele (prisma migrate deploy).
 */
export default async function prepararBancoDeTeste() {
  process.loadEnvFile(new URL('../../.env.test', import.meta.url));
  const url = new URL(process.env.DATABASE_URL!);
  const nomeBanco = url.pathname.slice(1);

  const admin = new URL(url);
  admin.pathname = '/postgres';
  admin.search = '';
  const cliente = new pg.Client({ connectionString: admin.toString() });
  await cliente.connect();
  const existe = await cliente.query('SELECT 1 FROM pg_database WHERE datname = $1', [nomeBanco]);
  if (existe.rowCount === 0) await cliente.query(`CREATE DATABASE "${nomeBanco}"`);
  await cliente.end();

  // TEST_SKIP_MIGRATE=1 permite pular este passo quando as migrations já foram aplicadas por outro meio.
  if (!process.env.TEST_SKIP_MIGRATE) {
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env } });
  }
}
