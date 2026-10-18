import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as insumosController from './insumos.controller.js';

export const insumosRoutes = Router();

insumosRoutes.use(autenticar);

insumosRoutes.get('/', insumosController.listar);
insumosRoutes.get('/resumo', insumosController.resumo); // antes de "/:id"
insumosRoutes.get('/:id', insumosController.buscarPorId);
insumosRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), insumosController.criar);
insumosRoutes.put('/:id', exigirPerfil('ADMIN', 'TECNICO'), insumosController.atualizar);
insumosRoutes.get('/:id/movimentacoes', insumosController.historico);
insumosRoutes.post('/:id/movimentacoes', exigirPerfil('ADMIN', 'TECNICO'), insumosController.movimentar);
