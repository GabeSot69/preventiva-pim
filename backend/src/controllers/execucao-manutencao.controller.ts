import { Request, Response } from 'express';
import { ExecucaoManutencaoService } from '../services/execucao-manutencao.service';
import type { CriarExecucaoManutencaoDTO, AtualizarExecucaoManutencaoDTO } from '../dtos';

const service = new ExecucaoManutencaoService();

export const criarExecucao = async (req: Request, res: Response) => {
  try {
    const dados = req.body as CriarExecucaoManutencaoDTO;
    const result = await service.criar(dados);
    return res.status(201).json(result);
  } catch (erro: any) {
    return res.status(erro.status || 500).json({ message: erro.message || 'Erro ao criar execução' });
  }
};

export const listarExecucoes = async (req: Request, res: Response) => {
  try {
    const result = await service.listar();
    return res.status(200).json(result);
  } catch (erro: any) {
    return res.status(erro.status || 500).json({ message: erro.message || 'Erro ao listar execuções' });
  }
};

export const obterExecucao = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string), 10);
    const result = await service.obterPorId(id);
    return res.status(200).json(result);
  } catch (erro: any) {
    return res.status(erro.status || 500).json({ message: erro.message || 'Erro ao obter execução' });
  }
};

export const atualizarExecucao = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string), 10);
    const dados = req.body as AtualizarExecucaoManutencaoDTO;
    const result = await service.atualizar(id, dados);
    return res.status(200).json(result);
  } catch (erro: any) {
    return res.status(erro.status || 500).json({ message: erro.message || 'Erro ao atualizar execução' });
  }
};

export const excluirExecucao = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string), 10);
    await service.excluir(id);
    return res.status(204).send();
  } catch (erro: any) {
    return res.status(erro.status || 500).json({ message: erro.message || 'Erro ao excluir execução' });
  }
};
