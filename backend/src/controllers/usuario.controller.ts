import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuario.service';
import { CriarUsuarioDTO, AtualizarUsuarioDTO } from '../dtos/usuario.dto';

export class UsuarioController {
  constructor(private service: UsuarioService) {}

  criar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(await this.service.criar(req.body as CriarUsuarioDTO));
    } catch (err) { next(err); }
  };

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      return res.status(200).json(await this.service.listar(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      ));
    } catch (err) { next(err); }
  };


  obterPorId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.obterPorId(Number(req.params.id)));
    } catch (err) { next(err); }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.atualizar(Number(req.params.id), req.body as AtualizarUsuarioDTO));
    } catch (err) { next(err); }
  };

  excluir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.excluir(Number(req.params.id));
      return res.status(204).send();
    } catch (err) { next(err); }
  };
}

