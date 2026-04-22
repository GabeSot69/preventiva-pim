import { Request, Response, NextFunction } from 'express';
import { PerfilService } from '../services/perfil.service';

export class PerfilController {
  constructor(private service: PerfilService) {}

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

