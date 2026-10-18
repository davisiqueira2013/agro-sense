import type { Perfil } from '../generated/prisma/client.js';

// Acrescenta o usuário autenticado ao objeto "req" do Express.
// Preenchido pelo middleware autenticar.
declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; nome: string; perfil: Perfil };
    }
  }
}

export {};
