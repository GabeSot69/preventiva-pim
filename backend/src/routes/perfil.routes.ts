import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller';
import { PerfilService } from '../services/perfil.service';
import { AppDataSource } from '../database';
import { Perfil } from '../entities/Perfil';

const router = Router();
const service = new PerfilService(AppDataSource.getRepository(Perfil));
const controller = new PerfilController(service);

router.get('/', controller.listar);
router.get('/:chave', controller.obterPorChave);

export default router;

