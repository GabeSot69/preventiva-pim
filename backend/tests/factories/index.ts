import { Factory } from 'fishery';
import { Equipamento } from '../../src/entities/Equipamento';
import { PlanoManutencao } from '../../src/entities/PlanoManutencao';
import { Usuario } from '../../src/entities/Usuario';

export const equipamentoFactory = Factory.define<Equipamento>(({ sequence }) => ({
  id: sequence,
  nome: `Equipamento ${sequence}`,
  ativo: true,
  data_aquisicao: new Date(),
  planos: [],
}));

export const planoFactory = Factory.define<PlanoManutencao>(({ sequence }) => ({
  id: sequence,
  titulo: `Plano ${sequence}`,
  periodicidade_dias: 30,
  ativo: true,
  proxima_em: new Date(),
  itens_checklist: [],
  equipamento: {} as any,
  tecnico: undefined,
  execucoes: [],
  calcularProximaData: () => new Date(),
}));
