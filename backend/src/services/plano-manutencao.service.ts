import { Repository, Between, LessThan, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { CriarPlanoManutencaoDTO, AtualizarPlanoManutencaoDTO } from '../dtos';
import { AppError } from '../errors';
import { PaginationUtils } from '../utils/pagination';

export interface FiltrosPlano {
  inicio?: string;
  fim?: string;
  status?: 'atrasado' | 'em_dia';
  equipamentoId?: number;
  ativo?: boolean;
  page?: number;
  limit?: number;
}

export class PlanoManutencaoService {
  constructor(private planoRepo: Repository<PlanoManutencao>) {}

  async criar(dados: CriarPlanoManutencaoDTO) {
    const plano = this.planoRepo.create({
      titulo: dados.titulo,
      descricao: dados.descricao,
      equipamento: { id: dados.equipamentoId },
      periodicidade_dias: dados.periodicidadeDias,
      tecnico: dados.tecnicoId ? { id: dados.tecnicoId } : undefined,
      proxima_em: dados.dataProximaManutencao ? new Date(dados.dataProximaManutencao) : undefined,
      itens_checklist: (dados as any).itensChecklist?.map((it: any, idx: number) => ({
        descricao: it.descricao,
        ordem: it.ordem ?? (idx + 1)
      }))
    } as any);
    return await this.planoRepo.save(plano);
  }

  async listar(filtros: FiltrosPlano = {}) {
    const where: FindOptionsWhere<PlanoManutencao> = {};
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const skip = PaginationUtils.getSkip(page, limit);

    where.ativo = filtros.ativo ?? true;

    if (filtros.equipamentoId) where.equipamento = { id: filtros.equipamentoId };
    if (filtros.tecnicoId) where.tecnico = { id: filtros.tecnicoId };

    if (filtros.inicio && filtros.fim) {
      where.proxima_em = Between(new Date(filtros.inicio), new Date(filtros.fim));
    } else if (filtros.inicio) {
      where.proxima_em = MoreThanOrEqual(new Date(filtros.inicio));
    } else if (filtros.fim) {
      where.proxima_em = LessThan(new Date(filtros.fim));
    }

    if (filtros.status === 'atrasado') {
      where.proxima_em = LessThan(agora);
    } else if (filtros.status === 'em_dia') {
      where.proxima_em = MoreThanOrEqual(agora);
    }

    const [items, total] = await this.planoRepo.findAndCount({
      where,
      relations: ['itens_checklist', 'equipamento', 'tecnico'],
      order: { proxima_em: 'ASC' },
      take: limit,
      skip: skip
    });

    return PaginationUtils.createResult(items, total, page, limit);
  }

  async obterPorId(id: number) {
    const plano = await this.planoRepo.findOne({
      where: { id },
      relations: ['itens_checklist', 'equipamento', 'tecnico', 'execucoes', 'execucoes.status', 'execucoes.tecnico', 'execucoes.checklist_execucao', 'execucoes.checklist_execucao.item']
    });
    if (!plano) throw new AppError(404, 'Plano de manutenção não encontrado');

    if (plano.execucoes) {
      plano.execucoes.sort((a, b) => new Date(b.data_execucao).getTime() - new Date(a.data_execucao).getTime());
      plano.execucoes = plano.execucoes.map(e => {
        if (e.tecnico) {
          const { senha_hash, trocar_senha, ...tecnico } = e.tecnico as any;
          e.tecnico = tecnico;
        }
        return e;
      });
    }

    return plano;
  }

  async atualizar(id: number, dados: AtualizarPlanoManutencaoDTO) {
    const plano = await this.obterPorId(id);
    const { equipamentoId, periodicidadeDias, tecnicoId, dataProximaManutencao, titulo, descricao, ativo } = dados;
    
    if (equipamentoId) (plano as any).equipamento = { id: equipamentoId };
    if (periodicidadeDias) plano.periodicidade_dias = periodicidadeDias;
    if (tecnicoId) (plano as any).tecnico = { id: tecnicoId };
    if (dataProximaManutencao) plano.proxima_em = new Date(dataProximaManutencao);
    if (titulo) plano.titulo = titulo;
    if (descricao !== undefined) plano.descricao = descricao;
    if (ativo !== undefined) plano.ativo = ativo;
    
    return await this.planoRepo.save(plano);
  }

  async excluir(id: number) {
    const plano = await this.planoRepo.findOne({ where: { id } });
    if (!plano) throw new AppError(404, 'Plano de manutenção não encontrado');
    return await this.planoRepo.remove(plano);
  }
}
