import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as diarioController from './diario.controller.js';

export const diarioRoutes = Router();

diarioRoutes.use(autenticar);

diarioRoutes.get('/', diarioController.listar);
diarioRoutes.post('/', exigirPerfil('ADMIN', 'TECNICO'), diarioController.criar);
// Autor ou ADMIN — conferido no service (RN10).
diarioRoutes.put('/:id', exigirPerfil('ADMIN', 'TECNICO'), diarioController.atualizar);
diarioRoutes.delete('/:id', exigirPerfil('ADMIN', 'TECNICO'), diarioController.excluir);
