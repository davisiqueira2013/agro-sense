import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as talhoesController from './talhoes.controller.js';

export const talhoesRoutes = Router();

// Todas as rotas exigem login; criar/editar/excluir dependem do perfil (RN02).
talhoesRoutes.use(autenticar);

talhoesRoutes.get('/', talhoesController.listar);
talhoesRoutes.get('/:id', talhoesController.buscarPorId);
talhoesRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), talhoesController.criar);
talhoesRoutes.put('/:id', exigirPerfil('ADMIN', 'TECNICO'), talhoesController.atualizar);
talhoesRoutes.delete('/:id', exigirPerfil('ADMIN'), talhoesController.excluir);
