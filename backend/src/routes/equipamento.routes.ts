import { Router } from 'express';
import { EquipamentoController } from '../controllers/equipamento.controller';
import { EquipamentoService } from '../services/equipamento.service';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarEquipamentoSchema, AtualizarEquipamentoSchema } from '../dtos';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { Equipamento } from '../entities/Equipamento';
import { PerfilChave } from '../constants/perfil';

const router = Router();
const service = new EquipamentoService(AppDataSource.getRepository(Equipamento));
const controller = new EquipamentoController(service);

router.post('/', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(CriarEquipamentoSchema), controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.put('/:id', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(AtualizarEquipamentoSchema), controller.atualizar);
router.delete('/:id', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.excluir);

export default router;
