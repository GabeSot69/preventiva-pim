import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { Equipamento } from '../entities/Equipamento';
import { AtualizarEquipamentoDTO, CriarEquipamentoDTO } from '../dtos';

export class EquipamentoService {
  private equipamentoRepo: Repository<Equipamento>;

  constructor() {
    this.equipamentoRepo = AppDataSource.getRepository(Equipamento);
  }

  async criar(dados: CriarEquipamentoDTO) {
    const equipamento = this.equipamentoRepo.create(dados as any);
    return await this.equipamentoRepo.save(equipamento);
  }

  async listar() {
    return await this.equipamentoRepo.find();
  }

  async obterPorId(id: number) {
    const equipamento = await this.equipamentoRepo.findOne({ where: { id } });
    if (!equipamento) throw new Error('Equipamento não encontrado');
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
