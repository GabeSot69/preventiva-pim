import { Repository } from 'typeorm';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { AppDataSource } from '../database';
import { CriarPlanoManutencaoDTO, AtualizarPlanoManutencaoDTO } from '../dtos';
import { AppError } from '../errors';

export class PlanoManutencaoService {
  private planoRepo: Repository<PlanoManutencao>;

  constructor() {
    this.planoRepo = AppDataSource.getRepository(PlanoManutencao);
  }

  async criar(dados: CriarPlanoManutencaoDTO) {
    const { equipamentoId, periodicidadeDias, tecnicoId, dataProximaManutencao, ...rest } = dados;
    
    let proximaEm = dataProximaManutencao;
    if (!proximaEm) {
      const data = new Date();
      data.setDate(data.getDate() + periodicidadeDias);
      proximaEm = data.toISOString().split('T')[0];
    }

    const plano = this.planoRepo.create({
      ...rest,
      equipamento: { id: equipamentoId },
      periodicidade_dias: periodicidadeDias,
      tecnico: tecnicoId ? { id: tecnicoId } : undefined,
      proxima_em: proximaEm
    } as any);
    
    return await this.planoRepo.save(plano);
  }

  async listar() {
    return await this.planoRepo.find({ relations: ['itens_checklist', 'equipamento', 'tecnico'] });
  }

  async obterPorId(id: number) {
    const plano = await this.planoRepo.findOne({ 
      where: { id }, 
      relations: ['itens_checklist', 'equipamento', 'tecnico'] 
    });
    if (!plano) throw new AppError(404, 'Plano de manutenção não encontrado');
    return plano;
  }

  async atualizar(id: number, dados: AtualizarPlanoManutencaoDTO) {
    const plano = await this.obterPorId(id);
    const { equipamentoId, periodicidadeDias, tecnicoId, dataProximaManutencao, ...rest } = dados;
    
    if (equipamentoId) (plano as any).equipamento = { id: equipamentoId };
    if (periodicidadeDias) plano.periodicidade_dias = periodicidadeDias;
    if (tecnicoId) (plano as any).tecnico = { id: tecnicoId };
    if (dataProximaManutencao) plano.proxima_em = dataProximaManutencao;
    
    Object.assign(plano, rest);
    
    return await this.planoRepo.save(plano);
  }

  async excluir(id: number) {
    const plano = await this.obterPorId(id);
    return await this.planoRepo.remove(plano);
  }
}
