import { Router } from 'express';
import { StatusExecucaoController } from '../controllers/status-execucao.controller';
import { StatusExecucaoService } from '../services/status-execucao.service';
import { AppDataSource } from '../database';
import { StatusExecucao } from '../entities/StatusExecucao';

const router = Router();
const service = new StatusExecucaoService(AppDataSource.getRepository(StatusExecucao));
const controller = new StatusExecucaoController(service);

router.get('/', controller.listar);
router.get('/:chave', controller.obterPorChave);

export default router;

