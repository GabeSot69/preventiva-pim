import { Repository } from 'typeorm';
import { StatusExecucao } from '../entities/StatusExecucao';
import { AppError } from '../errors';

export class StatusExecucaoService {
  constructor(private repo: Repository<StatusExecucao>) {}

  async listar() {
    return this.repo.find({ select: ['id', 'chave', 'descricao'] });
  }

  async obterPorChave(chave: string) {
    const status = await this.repo.findOne({ where: { chave }, select: ['id', 'chave', 'descricao'] });
    if (!status) throw new AppError(404, 'Status não encontrado');
    return status;
  }
}

