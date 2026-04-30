import { Request, Response, NextFunction } from 'express';
import { PlanoManutencaoService } from '../services/plano-manutencao.service';
import { CriarPlanoManutencaoDTO, AtualizarPlanoManutencaoDTO } from '../dtos';

export class PlanoManutencaoController {
  constructor(private service: PlanoManutencaoService) {}

  criar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(await this.service.criar(req.body as CriarPlanoManutencaoDTO));
    } catch (err) { next(err); }
  };

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filtros } = req.query;
      const { id: usuarioId, perfil } = req.usuario!;
      const tecnicoId = (perfil?.chave === 'tecnico') ? usuarioId : undefined;

      return res.status(200).json(await this.service.listar({
        ...filtros,
        tecnicoId: tecnicoId ? Number(tecnicoId) : (filtros.tecnicoId ? Number(filtros.tecnicoId) : undefined),
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined
      }));
    } catch (err) { next(err); }
  };

  obterPorId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.obterPorId(Number(req.params.id)));
    } catch (err) { next(err); }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.atualizar(Number(req.params.id), req.body as AtualizarPlanoManutencaoDTO));
    } catch (err) { next(err); }
  };

  excluir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.excluir(Number(req.params.id));
      return res.status(204).send();
    } catch (err) { next(err); }
  };
}
