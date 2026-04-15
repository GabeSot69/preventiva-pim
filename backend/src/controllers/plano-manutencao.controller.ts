import { Request, Response } from 'express';
import { PlanoManutencaoService } from '../services/plano-manutencao.service';
import { AppError } from '../errors';
import { CriarPlanoManutencaoDTO, AtualizarPlanoManutencaoDTO } from '../dtos';

const service = new PlanoManutencaoService();

export const criar = async (req: Request, res: Response) => {
  try {
    const dados = req.body as CriarPlanoManutencaoDTO;
    const result = await service.criar(dados);
    return res.status(201).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao criar plano de manutenção');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const listar = async (req: Request, res: Response) => {
  try {
    const result = await service.listar();
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao listar planos');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const obterPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await service.obterPorId(id);
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao obter plano de manutenção');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const atualizar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const dados = req.body as AtualizarPlanoManutencaoDTO;
    const result = await service.atualizar(id, dados);
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao atualizar plano');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const excluir = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.excluir(id);
    return res.status(204).send();
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao excluir plano');
    return res.status(erro.status).json({ message: erro.message });
  }
};
