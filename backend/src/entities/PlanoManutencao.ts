import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Equipamento } from './Equipamento';
import { Usuario } from './Usuario';
import { ExecucaoManutencao } from './ExecucaoManutencao';
import { ItemChecklistPlano } from './ItemChecklistPlano';

@Entity({ name: 'plano_manutencao' })
export class PlanoManutencao {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Equipamento, (e) => e.planos, { nullable: false, eager: true })
  equipamento!: Equipamento;

  @Column({ type: 'text' })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'int' })
  periodicidade_dias!: number;

  @ManyToOne(() => Usuario, { nullable: true })
  tecnico?: Usuario;

  @Column({ type: 'timestamptz', nullable: true })
  proxima_em?: Date;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm!: Date;

  @OneToMany(() => ExecucaoManutencao, (exec) => exec.plano)
  execucoes!: ExecucaoManutencao[];

  @OneToMany(() => ItemChecklistPlano, (item) => item.plano, { cascade: true })
  itens_checklist!: ItemChecklistPlano[];

  calcularProximaData(dataReferencia: Date = new Date()): Date {
    const proxima = new Date(dataReferencia);
    proxima.setDate(proxima.getDate() + this.periodicidade_dias);
    this.proxima_em = proxima;
    return proxima;
  }
}


