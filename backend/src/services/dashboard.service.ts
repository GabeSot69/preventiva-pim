import { Repository, LessThan } from 'typeorm';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';
import { ItemChecklistExecucao } from '../entities/ItemChecklistExecucao';

export class DashboardService {
  constructor(
    private planoRepo: Repository<PlanoManutencao>,
    private execucaoRepo: Repository<ExecucaoManutencao>,
    private equipamentoRepo: Repository<Equipamento>
  ) {}

  async getMetrics() {
    const agora = new Date();
    const seteDiasDepois = new Date();
    seteDiasDepois.setDate(agora.getDate() + 7);

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    const [atrasadasCount, previstas7DiasCount, execucoesMesCount] = await Promise.all([
      this.planoRepo.count({ where: { ativo: true, proxima_em: LessThan(agora) } }),
      this.planoRepo.createQueryBuilder('plano')
        .where('plano.ativo = :ativo', { ativo: true })
        .andWhere('plano.proxima_em BETWEEN :agora AND :seteDias', { agora, seteDias: seteDiasDepois })
        .getCount(),
      this.execucaoRepo.createQueryBuilder('exec')
        .where('exec.data_execucao BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
        .getCount()
    ]);

    // Cálculo de conformidade via SQL
    const conformidadeRaw = await this.execucaoRepo.manager
      .createQueryBuilder(ItemChecklistExecucao, 'item')
      .innerJoin('item.execucao', 'exec')
      .select('COUNT(item.id)', 'total')
      .addSelect('SUM(CASE WHEN item.conforme = true THEN 1 ELSE 0 END)', 'conformes')
      .where('exec.data_execucao BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
      .getRawOne();

    const totalItens = parseInt(conformidadeRaw?.total || '0');
    const totalConformes = parseInt(conformidadeRaw?.conformes || '0');

    return {
      atrasadas: atrasadasCount,
      previstas7Dias: previstas7DiasCount,
      execucoesNoMes: execucoesMesCount,
      conformidadeGeralChecklist: totalItens > 0 ? Math.round((totalConformes / totalItens) * 100) : 100
    };
  }

  async getAtrasadas() {
    const agora = new Date();
    const atrasadas = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(agora) },
      relations: ['equipamento']
    });

    return atrasadas.map(plano => {
      const diffMs = agora.getTime() - plano.proxima_em!.getTime();
      return {
        id: plano.id,
        plano: plano.titulo,
        equipamento: plano.equipamento.nome,
        proxima_em: plano.proxima_em,
        dias_atraso: Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      };
    });
  }

  async getDisponibilidade() {
    const total = await this.equipamentoRepo.count();
    const ativos = await this.equipamentoRepo.count({ where: { ativo: true } });

    const planosAtrasados = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(new Date()) },
      relations: ['equipamento']
    });

    const idsAtrasados = new Set(planosAtrasados.map(p => p.equipamento.id));
    const disponiveis = total - idsAtrasados.size;

    return {
      totalEquipamentos: total,
      equipamentosAtivos: ativos,
      equipamentosDisponiveis: disponiveis,
      percentualDisponibilidade: total > 0 ? Math.round((disponiveis / total) * 100) : 0
    };
  }
}
