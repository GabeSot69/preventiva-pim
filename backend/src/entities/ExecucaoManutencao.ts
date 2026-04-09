import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { StatusExecucao } from '../types';
import { PlanoManutencao } from './PlanoManutencao';
import { Usuario } from './Usuario';
import { ItemChecklistExecucao } from './ItemChecklistExecucao';

@Entity({ name: 'execucao_manutencao' })
export class ExecucaoManutencao {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanoManutencao, (p) => p.execucoes, { nullable: false, eager: true })
  plano!: PlanoManutencao;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  tecnico?: Usuario;

  @Column({ type: 'date' })
  data_execucao!: string;

  @Column({ type: 'enum', enum: ['realizada', 'parcial', 'nao_realizada'] })
  status!: StatusExecucao;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column()
  conformidade!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  registrado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm!: Date;

  @OneToMany(() => ItemChecklistExecucao, (ci) => ci.execucao, { cascade: true })
  checklist_execucao!: ItemChecklistExecucao[];
}