import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import * as authController from './auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', autenticar, authController.me);
