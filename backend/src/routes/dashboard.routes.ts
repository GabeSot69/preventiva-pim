import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';
import { PerfilChave } from '../constants/perfil';

const router = Router();

const service = new DashboardService(
  AppDataSource.getRepository(PlanoManutencao),
  AppDataSource.getRepository(ExecucaoManutencao),
  AppDataSource.getRepository(Equipamento)
);
const controller = new DashboardController(service);

router.get('/metricas', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR, PerfilChave.TI), controller.getMetrics);
router.get('/atrasadas', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR, PerfilChave.TI), controller.getAtrasadas);
router.get('/disponibilidade', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR, PerfilChave.TI), controller.getDisponibilidade);
router.get('/em-dia', autorizar(PerfilChave.SUPERVISOR, PerfilChave.GESTOR, PerfilChave.TI), controller.getEmDia);

export default router;
