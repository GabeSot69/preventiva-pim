import { Router } from 'express';
import { criar, listar, obterPorId, atualizar, excluir } from '../controllers/equipamento.controller';
import { validateBody } from '../middlewares/validate-body.middleware';
import { CriarEquipamentoSchema, AtualizarEquipamentoSchema } from '../dtos';

const router = Router();

router.post('/', validateBody(CriarEquipamentoSchema), criar);
router.get('/', listar);
router.get('/:id', obterPorId);
router.put('/:id', validateBody(AtualizarEquipamentoSchema), atualizar);
router.delete('/:id', excluir);

export default router;
