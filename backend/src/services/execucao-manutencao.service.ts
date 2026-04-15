import { Repository } from 'typeorm';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { AppDataSource } from '../database';
import { AppError } from '../errors';
import type { CriarExecucaoManutencaoDTO, AtualizarExecucaoManutencaoDTO } from '../dtos';
import { StatusExecucao } from '../entities/StatusExecucao';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { Usuario } from '../entities/Usuario';
import { ItemChecklistExecucao } from '../entities/ItemChecklistExecucao';
import { ItemChecklistPlano } from '../entities/ItemChecklistPlano';

export class ExecucaoManutencaoService {
  private repo: Repository<ExecucaoManutencao>;
  constructor() {
    this.repo = AppDataSource.getRepository(ExecucaoManutencao);
  }

  private async getStatus(chave: string) {
    const repo = AppDataSource.getRepository(StatusExecucao);
    const status = await repo.findOne({ where: { chave } });
    if (!status) throw new AppError(400, `Status de execução inválido: ${chave}`);
    return status;
  }

  private async getPlano(id: number) {
    const repo = AppDataSource.getRepository(PlanoManutencao);
    const plano = await repo.findOne({ where: { id } });
    if (!plano) throw new AppError(400, `Plano de manutenção não encontrado: ${id}`);
    return plano;
  }

  private async getTecnico(id?: number) {
    if (!id) return undefined;
    const repo = AppDataSource.getRepository(Usuario);
    const usuario = await repo.findOne({ where: { id } });
    if (!usuario) throw new AppError(400, `Técnico não encontrado: ${id}`);
    return usuario;
  }

  private async buildChecklist(items?: { itemId: number; conforme: boolean; observacao?: string }[]) {
    if (!items) return [] as ItemChecklistExecucao[];
    const itemRepo = AppDataSource.getRepository(ItemChecklistPlano);
    const lista: ItemChecklistExecucao[] = [];
    for (const it of items) {
      const planoItem = await itemRepo.findOne({ where: { id: it.itemId } });
      if (!planoItem) throw new AppError(400, `Item de checklist não encontrado: ${it.itemId}`);
      const ic = new ItemChecklistExecucao();
      ic.item = planoItem;
      ic.conforme = it.conforme;
      ic.observacao = it.observacao;
      lista.push(ic);
    }
    return lista;
  }

  async criar(dados: CriarExecucaoManutencaoDTO) {
    const exec = new ExecucaoManutencao();

    exec.plano = await this.getPlano(dados.planoId);
    exec.tecnico = await this.getTecnico(dados.tecnicoId as any);
    exec.data_execucao = dados.dataExecucao || new Date().toISOString().slice(0, 10);
    exec.status = await this.getStatus(dados.status as any);
    exec.observacoes = dados.observacoes;
    exec.conformidade = dados.conformidade;
    exec.checklist_execucao = await this.buildChecklist(dados.checklist as any);

    return await this.repo.save(exec);
  }

  async listar() {
    return await this.repo.find({ relations: ['plano', 'tecnico', 'status', 'checklist_execucao'] });
  }

  async obterPorId(id: number) {
    const e = await this.repo.findOne({ where: { id }, relations: ['plano', 'tecnico', 'status', 'checklist_execucao'] });
    if (!e) throw new AppError(404, 'Execução não encontrada');
    return e;
  }

  async atualizar(id: number, dados: AtualizarExecucaoManutencaoDTO) {
    const e = await this.obterPorId(id);
    if (dados.planoId) e.plano = await this.getPlano(dados.planoId as any);
    if (dados.tecnicoId) e.tecnico = await this.getTecnico(dados.tecnicoId as any);
    if (dados.dataExecucao) e.data_execucao = dados.dataExecucao as any;
    if (dados.status) e.status = await this.getStatus(dados.status as any);
    if (typeof dados.conformidade === 'boolean') e.conformidade = dados.conformidade as any;
    if (dados.observacoes !== undefined) e.observacoes = dados.observacoes as any;
    if (dados.checklist) e.checklist_execucao = await this.buildChecklist(dados.checklist as any);

    return await this.repo.save(e);
  }

  async excluir(id: number) {
    const e = await this.obterPorId(id);
    await this.repo.remove(e);
    return true;
  }
}
