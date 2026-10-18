import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as atividadesController from './atividades.controller.js';

export const atividadesRoutes = Router();

atividadesRoutes.use(autenticar);

atividadesRoutes.get('/', atividadesController.listar);
atividadesRoutes.get('/:id', atividadesController.buscarPorId);
atividadesRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), atividadesController.criar);
atividadesRoutes.put('/:id', exigirPerfil('ADMIN', 'TECNICO'), atividadesController.atualizar);
atividadesRoutes.patch('/:id/status', exigirPerfil('ADMIN', 'TECNICO'), atividadesController.alterarStatus);
atividadesRoutes.delete('/:id', exigirPerfil('ADMIN'), atividadesController.excluir);
