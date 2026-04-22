import { In, Repository } from 'typeorm';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { AppError } from '../errors';
import type { CriarExecucaoManutencaoDTO, AtualizarExecucaoManutencaoDTO } from '../dtos';
import { StatusExecucao } from '../entities/StatusExecucao';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { Usuario } from '../entities/Usuario';
import { ItemChecklistExecucao } from '../entities/ItemChecklistExecucao';
import { ItemChecklistPlano } from '../entities/ItemChecklistPlano';
import { AppDataSource } from '../database';
import { PaginationUtils } from '../utils/pagination';

export class ExecucaoManutencaoService {
  constructor(
    private repo: Repository<ExecucaoManutencao>,
    private statusRepo: Repository<StatusExecucao>,
    private planoRepo: Repository<PlanoManutencao>,
    private usuarioRepo: Repository<Usuario>,
    private itemChecklistPlanoRepo: Repository<ItemChecklistPlano>
  ) {}

  private async getStatus(chave: string) {
    const status = await this.statusRepo.findOne({ where: { chave } });
    if (!status) throw new AppError(400, `Status de execução inválido: ${chave}`);
    return status;
  }

  private async getPlano(id: number) {
    const plano = await this.planoRepo.findOne({ where: { id } });
    if (!plano) throw new AppError(400, `Plano de manutenção não encontrado: ${id}`);
    return plano;
  }

  private async getTecnico(id?: number) {
    if (!id) return undefined;
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new AppError(400, `Técnico não encontrado: ${id}`);
    return usuario;
  }

  private async buildChecklist(planoId: number, items?: { itemId: number; conforme: boolean; observacao?: string }[]) {
    if (!items?.length) return [] as ItemChecklistExecucao[];

    const ids = items.map(i => i.itemId);
    const planoItems = await this.itemChecklistPlanoRepo.find({ where: { id: In(ids), plano: { id: planoId } } });

    if (planoItems.length !== ids.length) {
      const encontrados = new Set(planoItems.map(p => p.id));
      const faltando = ids.find(id => !encontrados.has(id));
      throw new AppError(400, `Item de checklist não encontrado ou não pertence a este plano: ${faltando}`);
    }

    const planoItemMap = new Map(planoItems.map(p => [p.id, p]));
    return items.map(it => {
      const ic = new ItemChecklistExecucao();
      ic.item = planoItemMap.get(it.itemId)!;
      ic.conforme = it.conforme;
      ic.observacao = it.observacao;
      return ic;
    });
  }

  private toResponse(e: ExecucaoManutencao) {
    const tecnico = e.tecnico
      ? (({ senha_hash, trocar_senha, ...t }) => t)(e.tecnico as any)
      : undefined;
    return {
      id: e.id,
      plano: e.plano,
      tecnico,
      data_execucao: e.data_execucao,
      status: e.status,
      observacoes: e.observacoes,
      conformidade: e.conformidade,
      registrado_em: e.registrado_em,
      checklist_execucao: e.checklist_execucao,
      percentual_conformidade: e.checklist_execucao?.length
        ? Math.round(e.checklist_execucao.filter(i => i.conforme).length / e.checklist_execucao.length * 100)
        : 100,
    };
  }

  async criar(dados: CriarExecucaoManutencaoDTO) {
    return await AppDataSource.transaction(async (manager) => {
      const plano = await manager.findOne(PlanoManutencao, { where: { id: dados.planoId } });
      if (!plano) throw new AppError(400, 'Plano não encontrado');

      const exec = new ExecucaoManutencao();
      exec.plano = plano;
      exec.tecnico = await this.getTecnico(dados.tecnicoId as any);
      exec.data_execucao = dados.dataExecucao ? new Date(dados.dataExecucao) : new Date();
      exec.status = await this.getStatus(dados.status as any);
      exec.observacoes = dados.observacoes;
      exec.conformidade = dados.conformidade;
      exec.checklist_execucao = await this.buildChecklist(dados.planoId, dados.checklist as any);

      const salvo = await manager.save(exec);

      // Regra de Domínio Rico: O próprio plano sabe como se atualizar
      plano.calcularProximaData(exec.data_execucao);
      await manager.save(plano);

      const fullExec = await manager.findOne(ExecucaoManutencao, { 
        where: { id: salvo.id }, 
        relations: ['plano', 'tecnico', 'status', 'checklist_execucao'] 
      });
      return this.toResponse(fullExec!);
    });
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = PaginationUtils.getSkip(page, limit);
    const [execs, total] = await this.repo.findAndCount({ 
      relations: ['plano', 'tecnico', 'status', 'checklist_execucao'],
      take: limit,
      skip: skip,
      order: { data_execucao: 'DESC' }
    });
    
    return PaginationUtils.createResult(execs.map(e => this.toResponse(e)), total, page, limit);
  }

  async obterPorId(id: number) {
    const e = await this.repo.findOne({ where: { id }, relations: ['plano', 'tecnico', 'status', 'checklist_execucao'] });
    if (!e) throw new AppError(404, 'Execução não encontrada');
    return this.toResponse(e);
  }

  async atualizar(id: number, dados: AtualizarExecucaoManutencaoDTO) {
    const e = await this.repo.findOne({ where: { id }, relations: ['plano', 'tecnico', 'status', 'checklist_execucao'] });
    if (!e) throw new AppError(404, 'Execução não encontrada');
    
    if (dados.planoId) e.plano = await this.getPlano(dados.planoId as any);
    if (dados.tecnicoId) e.tecnico = await this.getTecnico(dados.tecnicoId as any);
    if (dados.dataExecucao) e.data_execucao = new Date(dados.dataExecucao);
    if (dados.status) e.status = await this.getStatus(dados.status as any);
    if (typeof dados.conformidade === 'boolean') e.conformidade = dados.conformidade;
    if (dados.observacoes !== undefined) e.observacoes = dados.observacoes;
    if (dados.checklist) e.checklist_execucao = await this.buildChecklist(e.plano.id, dados.checklist as any);
    
    return this.toResponse(await this.repo.save(e));
  }

  async excluir(id: number) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new AppError(404, 'Execução não encontrada');
    await this.repo.remove(e);
    return true;
  }
}
