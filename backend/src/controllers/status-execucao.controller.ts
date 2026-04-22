import { Request, Response, NextFunction } from 'express';
import { StatusExecucaoService } from '../services/status-execucao.service';

export class StatusExecucaoController {
  constructor(private service: StatusExecucaoService) {}

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.listar());
    } catch (err) { next(err); }
  };

  obterPorChave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.obterPorChave(String(req.params.chave)));
    } catch (err) { next(err); }
  };
}

