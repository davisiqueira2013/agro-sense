import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { exigirPerfil } from '../../middlewares/exigirPerfil.js';
import * as usuariosController from './usuarios.controller.js';

export const usuariosRoutes = Router();

usuariosRoutes.use(autenticar);

// Qualquer usuário logado: lista de responsáveis para os formulários.
usuariosRoutes.get('/responsaveis', usuariosController.responsaveis);

// Gestão de usuários: somente ADMIN (RN02, RN11).
usuariosRoutes.get('/', exigirPerfil('ADMIN'), usuariosController.listar);
usuariosRoutes.post('/', exigirPerfil('ADMIN'), usuariosController.criar);
usuariosRoutes.put('/:id', exigirPerfil('ADMIN'), usuariosController.atualizar);
usuariosRoutes.patch('/:id/status', exigirPerfil('ADMIN'), usuariosController.alterarStatus);
