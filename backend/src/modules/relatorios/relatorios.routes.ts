import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as relatoriosController from './relatorios.controller.js';

// RN12 — relatórios em PDF gerados no servidor.
export const relatoriosRoutes = Router();

relatoriosRoutes.use(autenticar);

relatoriosRoutes.get('/', relatoriosController.listar);
relatoriosRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), relatoriosController.gerar);
relatoriosRoutes.get('/:id/pdf', relatoriosController.baixar);
relatoriosRoutes.delete('/:id', exigirPerfil('ADMIN'), relatoriosController.excluir);
