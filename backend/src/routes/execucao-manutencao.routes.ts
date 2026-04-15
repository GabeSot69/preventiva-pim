import { Router } from 'express';
import {
  criarExecucao,
  listarExecucoes,
  obterExecucao,
  atualizarExecucao,
  excluirExecucao,
} from '../controllers/execucao-manutencao.controller';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarExecucaoManutencaoSchema, AtualizarExecucaoManutencaoSchema } from '../dtos';

const router = Router();

router.post('/', validateBody(CriarExecucaoManutencaoSchema), criarExecucao);
router.get('/', listarExecucoes);
router.get('/:id', obterExecucao);
router.put('/:id', validateBody(AtualizarExecucaoManutencaoSchema), atualizarExecucao);
router.delete('/:id', excluirExecucao);

export default router;
