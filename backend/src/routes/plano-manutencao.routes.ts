import { Router } from 'express';
import { criar, listar, obterPorId, atualizar, excluir } from '../controllers/plano-manutencao.controller';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarPlanoManutencaoSchema, AtualizarPlanoManutencaoSchema } from '../dtos';

const router = Router();

router.post('/', validateBody(CriarPlanoManutencaoSchema), criar);
router.get('/', listar);
router.get('/:id', obterPorId);
router.put('/:id', validateBody(AtualizarPlanoManutencaoSchema), atualizar);
router.delete('/:id', excluir);

export default router;
