import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Perfil } from './Perfil';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  nome!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  senha_hash!: string;

  @ManyToOne(() => Perfil, { eager: true })
  @JoinColumn({ name: 'perfil_id' })
  perfil!: Perfil;

  @Column({ type: 'text', nullable: true })
  setor?: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;
}
