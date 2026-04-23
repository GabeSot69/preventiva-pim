import { Factory } from 'fishery';
import { Equipamento } from '../../src/entities/Equipamento';
import { PlanoManutencao } from '../../src/entities/PlanoManutencao';
import { Usuario } from '../../src/entities/Usuario';

export const equipamentoFactory = Factory.define<Equipamento>(({ sequence }) => ({
  id: sequence,
  codigo: `EQ-${sequence}`,
  nome: `Equipamento ${sequence}`,
  tipo: 'Industrial',
  localizacao: 'Galpão A',
  fabricante: 'Fabricante X',
  modelo: 'Modelo Y',
  ativo: true,
  planos: [],
}));

export const planoFactory = Factory.define<PlanoManutencao>(({ sequence }) => ({
  id: sequence,
  titulo: `Plano ${sequence}`,
  descricao: `Descrição do plano ${sequence}`,
  periodicidade_dias: 30,
  ativo: true,
  proxima_em: new Date(),
  itens_checklist: [],
  equipamento: {} as any,
  tecnico: undefined,
  execucoes: [],
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  calcularProximaData: () => new Date(),
}));
