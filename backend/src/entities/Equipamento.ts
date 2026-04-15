import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { PlanoManutencao } from './PlanoManutencao';

@Entity({ name: 'equipamento' })
export class Equipamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  codigo!: string;

  @Column({ type: 'text' })
  nome!: string;

  @Column({ type: 'text' })
  tipo!: string;

  @Column({ type: 'text' })
  localizacao!: string;

  @Column({ type: 'text', nullable: true })
  fabricante?: string;

  @Column({ type: 'text', nullable: true })
  modelo?: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @OneToMany(() => PlanoManutencao, (p) => p.equipamento)
  planos!: PlanoManutencao[];
}