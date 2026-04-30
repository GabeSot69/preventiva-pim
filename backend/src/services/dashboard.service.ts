import { Repository, LessThan } from 'typeorm';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';

export class DashboardService {
  constructor(
    private planoRepo: Repository<PlanoManutencao>,
    private execucaoRepo: Repository<ExecucaoManutencao>,
    private equipamentoRepo: Repository<Equipamento>
  ) {}

  async getMetrics() {
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const seteDiasDepois = new Date(agora);
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

    // Lógica de Conformidade US05: (Realizadas no Prazo / Total Execuções) * 100
    // Consideramos "no prazo" se data_execucao <= proxima_em (armazenado na execução se houver o campo, 
    // ou comparando com a conformidade booleana do registro)
    const execucoesMes = await this.execucaoRepo.createQueryBuilder('exec')
      .where('exec.data_execucao BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
      .getMany();

    const realizadasNoPrazo = execucoesMes.filter(e => e.conformidade === true).length;
    const conformidadeMensal = execucoesMes.length > 0 
      ? Math.round((realizadasNoPrazo / execucoesMes.length) * 100) 
      : 100;

    return {
      atrasadas: atrasadasCount,
      previstas7Dias: previstas7DiasCount,
      execucoesNoMes: execucoesMesCount,
      conformidadeMensal: conformidadeMensal
    };
  }

  async getAtrasadas() {
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const atrasadas = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(agora) },
      relations: ['equipamento']
    });

    const hojeParaCalculo = new Date();
    return atrasadas.map(plano => {
      const diffMs = hojeParaCalculo.getTime() - plano.proxima_em!.getTime();
      return {
        id: plano.id,
        titulo: plano.titulo, // Nome alterado de 'plano' para 'titulo' para bater com o frontend
        equipamento: {
          id: plano.equipamento.id,
          nome: plano.equipamento.nome,
          codigo: plano.equipamento.codigo
        },
        proxima_em: plano.proxima_em,
        dias_atraso: Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      };
    });
  }

  async getDisponibilidade() {
    const total = await this.equipamentoRepo.count();
    const ativos = await this.equipamentoRepo.count({ where: { ativo: true } });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const planosAtrasados = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(hoje) },
      relations: ['equipamento']
    });

    const idsEquipamentosComAtraso = new Set(planosAtrasados.map(p => p.equipamento.id));
    const disponiveis = total - idsEquipamentosComAtraso.size;

    return {
      totalEquipamentos: total,
      equipamentosAtivos: ativos,
      equipamentosComAtraso: idsEquipamentosComAtraso.size,
      equipamentosDisponiveis: disponiveis,
      percentualDisponibilidade: total > 0 ? Math.round((disponiveis / total) * 100) : 0
    };
  }
}
