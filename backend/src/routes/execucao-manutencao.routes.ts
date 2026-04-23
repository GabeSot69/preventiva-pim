import { Router } from 'express';
import { ExecucaoManutencaoController } from '../controllers/execucao-manutencao.controller';
import { ExecucaoManutencaoService } from '../services/execucao-manutencao.service';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarExecucaoManutencaoSchema, AtualizarExecucaoManutencaoSchema } from '../dtos';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { StatusExecucao } from '../entities/StatusExecucao';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { Usuario } from '../entities/Usuario';
import { ItemChecklistPlano } from '../entities/ItemChecklistPlano';
import { PerfilChave } from '../constants/perfil';

const router = Router();
const service = new ExecucaoManutencaoService(
  AppDataSource.getRepository(ExecucaoManutencao),
  AppDataSource.getRepository(StatusExecucao),
  AppDataSource.getRepository(PlanoManutencao),
  AppDataSource.getRepository(Usuario),
  AppDataSource.getRepository(ItemChecklistPlano)
);
const controller = new ExecucaoManutencaoController(service);

router.post('/', autorizar(PerfilChave.TECNICO, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(CriarExecucaoManutencaoSchema), controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);
router.put('/:id', autorizar(PerfilChave.TECNICO, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), validateBody(AtualizarExecucaoManutencaoSchema), controller.atualizar);
router.delete('/:id', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.excluir);

export default router;
