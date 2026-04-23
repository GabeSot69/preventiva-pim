import { Router } from 'express';
import { PlanoManutencaoController } from '../controllers/plano-manutencao.controller';
import { PlanoManutencaoService } from '../services/plano-manutencao.service';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarPlanoManutencaoSchema, AtualizarPlanoManutencaoSchema } from '../dtos';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { PerfilChave } from '../constants/perfil';

const router = Router();
const service = new PlanoManutencaoService(
  AppDataSource.getRepository(PlanoManutencao)
);
const controller = new PlanoManutencaoController(service);

router.post('/', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(CriarPlanoManutencaoSchema), controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.put('/:id', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(AtualizarPlanoManutencaoSchema), controller.atualizar);
router.delete('/:id', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.excluir);

export default router;
