import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';

const router = Router();

const service = new DashboardService(
  AppDataSource.getRepository(PlanoManutencao),
  AppDataSource.getRepository(ExecucaoManutencao),
  AppDataSource.getRepository(Equipamento)
);
const controller = new DashboardController(service);

router.get('/metricas', autorizar('supervisor', 'gestor'), controller.getMetrics);
router.get('/atrasadas', autorizar('supervisor', 'gestor'), controller.getAtrasadas);
router.get('/disponibilidade', autorizar('supervisor', 'gestor'), controller.getDisponibilidade);

export default router;
