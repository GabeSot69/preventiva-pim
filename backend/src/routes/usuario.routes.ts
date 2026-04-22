import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { autorizar } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarUsuarioSchema, AtualizarUsuarioSchema } from '../dtos/usuario.dto';
import { AppDataSource } from '../database';
import { Usuario } from '../entities/Usuario';
import { Perfil } from '../entities/Perfil';

const router = Router();

const service = new UsuarioService(
  AppDataSource.getRepository(Usuario),
  AppDataSource.getRepository(Perfil)
);
const controller = new UsuarioController(service);

router.use(autorizar('gestor'));

router.post('/', validateBody(CriarUsuarioSchema), controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.put('/:id', validateBody(AtualizarUsuarioSchema), controller.atualizar);
router.delete('/:id', controller.excluir);

export default router;

