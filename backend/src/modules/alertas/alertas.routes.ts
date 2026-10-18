import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as alertasController from './alertas.controller.js';

export const alertasRoutes = Router();

alertasRoutes.use(autenticar);

alertasRoutes.get('/', alertasController.listar);
alertasRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), alertasController.criar);
alertasRoutes.post('/sincronizar', exigirPerfil('ADMIN', 'TECNICO'), alertasController.sincronizar);
alertasRoutes.patch('/:id/encerrar', exigirPerfil('ADMIN', 'TECNICO'), alertasController.encerrar);
