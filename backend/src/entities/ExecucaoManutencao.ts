import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StatusExecucao } from './StatusExecucao';
import { PlanoManutencao } from './PlanoManutencao';
import { Usuario } from './Usuario';
import { ItemChecklistExecucao } from './ItemChecklistExecucao';

@Entity({ name: 'execucao_manutencao' })
export class ExecucaoManutencao {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanoManutencao, (p) => p.execucoes, { nullable: false })
  plano!: PlanoManutencao;

  @ManyToOne(() => Usuario, { nullable: true })
  tecnico?: Usuario;

  @Column({ type: 'timestamptz' })
  data_execucao!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  data_prevista?: Date;

  @ManyToOne(() => StatusExecucao, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status!: StatusExecucao;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'boolean' })
  conformidade!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  registrado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm!: Date;

  @OneToMany(() => ItemChecklistExecucao, (ci) => ci.execucao, { cascade: true })
  checklist_execucao!: ItemChecklistExecucao[];
}

