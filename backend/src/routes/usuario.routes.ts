import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarUsuarioSchema, AtualizarUsuarioSchema } from '../dtos';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { Usuario } from '../entities/Usuario';
import { Perfil } from '../entities/Perfil';
import { PerfilChave } from '../constants/perfil';

const router = Router();
const service = new UsuarioService(
  AppDataSource.getRepository(Usuario),
  AppDataSource.getRepository(Perfil)
);
const controller = new UsuarioController(service);

router.post('/', autorizar(PerfilChave.GESTOR, PerfilChave.TI), validateBody(CriarUsuarioSchema), controller.criar);
router.get('/', autorizar(PerfilChave.GESTOR, PerfilChave.TI, PerfilChave.SUPERVISOR), controller.listar);
router.get('/:id', autorizar(PerfilChave.GESTOR, PerfilChave.TI, PerfilChave.SUPERVISOR), controller.obterPorId);
router.put('/:id', autorizar(PerfilChave.GESTOR, PerfilChave.TI), validateBody(AtualizarUsuarioSchema), controller.atualizar);
router.delete('/:id', autorizar(PerfilChave.GESTOR, PerfilChave.TI), controller.excluir);

export default router;
