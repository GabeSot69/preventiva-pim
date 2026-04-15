import { Request, Response } from 'express';
import { EquipamentoService } from '../services/equipamento.service';
import { AppError } from '../errors';
import { CriarEquipamentoDTO, AtualizarEquipamentoDTO } from '../dtos';

const service = new EquipamentoService();

export const criar = async (req: Request, res: Response) => {
  try {
    const dados = req.body as CriarEquipamentoDTO;
    const result = await service.criar(dados);
    return res.status(201).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao criar equipamento');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const listar = async (req: Request, res: Response) => {
  try {
    const result = await service.listar();
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao listar equipamentos');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const obterPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await service.obterPorId(id);
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(404, 'Equipamento não encontrado');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const atualizar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const dados = req.body as AtualizarEquipamentoDTO;
    const result = await service.atualizar(id, dados);
    return res.status(200).json(result);
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao atualizar equipamento');
    return res.status(erro.status).json({ message: erro.message });
  }
};

export const excluir = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.excluir(id);
    return res.status(204).send();
  } catch (err) {
    const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao excluir equipamento');
    return res.status(erro.status).json({ message: erro.message });
  }
};
