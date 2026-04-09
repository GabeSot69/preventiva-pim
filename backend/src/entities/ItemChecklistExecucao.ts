import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ExecucaoManutencao } from './ExecucaoManutencao';
import { ItemChecklistPlano } from './ItemChecklistPlano';

@Entity({ name: 'item_checklist_execucao' })
export class ItemChecklistExecucao {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ExecucaoManutencao, (e) => e.checklist_execucao, { nullable: false })
  execucao!: ExecucaoManutencao;

  @ManyToOne(() => ItemChecklistPlano, { nullable: false, eager: true })
  item!: ItemChecklistPlano;

  @Column({ type: 'boolean' })
  conforme!: boolean;

  @Column({ type: 'text', nullable: true })
  observacao?: string;
}