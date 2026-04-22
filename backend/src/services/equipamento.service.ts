import { Repository } from 'typeorm';
import { Equipamento } from '../entities/Equipamento';
import { AtualizarEquipamentoDTO, CriarEquipamentoDTO } from '../dtos';
import { AppError } from '../errors';
import { PaginationUtils } from '../utils/pagination';

export class EquipamentoService {
  constructor(private equipamentoRepo: Repository<Equipamento>) {}

  async criar(dados: CriarEquipamentoDTO) {
    const equipamento = this.equipamentoRepo.create(dados as any);
    return await this.equipamentoRepo.save(equipamento);
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = PaginationUtils.getSkip(page, limit);
    const [items, total] = await this.equipamentoRepo.findAndCount({
      where: { ativo: true },
      take: limit,
      skip: skip
    });

    return PaginationUtils.createResult(items, total, page, limit);
  }

  async obterPorId(id: number) {
    const equipamento = await this.equipamentoRepo.findOne({ where: { id } });
    if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');
    return equipamento;
  }

  async atualizar(id: number, dados: AtualizarEquipamentoDTO) {
    const equipamento = await this.obterPorId(id);
    Object.assign(equipamento, dados as any);
    return await this.equipamentoRepo.save(equipamento);
  }

  async excluir(id: number) {
    const equipamento = await this.obterPorId(id);
    return await this.equipamentoRepo.remove(equipamento);
  }
}
