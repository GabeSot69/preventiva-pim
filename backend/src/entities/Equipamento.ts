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

  @Column({ unique: true })
  codigo!: string;

  @Column()
  nome!: string;

  @Column()
  tipo!: string;

  @Column()
  localizacao!: string;

  @Column({ nullable: true })
  fabricante?: string;

  @Column({ nullable: true })
  modelo?: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @OneToMany(() => PlanoManutencao, (p) => p.equipamento)
  planos!: PlanoManutencao[];
}