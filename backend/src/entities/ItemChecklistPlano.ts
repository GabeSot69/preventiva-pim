import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PlanoManutencao } from './PlanoManutencao';

@Entity({ name: 'item_checklist_plano' })
export class ItemChecklistPlano {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanoManutencao, (p) => p.itens_checklist, { nullable: false })
  plano!: PlanoManutencao;

  @Column({ type: 'text' })
  descricao!: string;

  @Column({ type: 'int'})
  ordem!: number;
}
