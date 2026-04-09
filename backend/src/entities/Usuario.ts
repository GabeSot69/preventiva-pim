import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import type { PerfilUsuario } from '../types';

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

  @Column({ type: 'enum', enum: ['gestor', 'tecnico', 'supervisor'], default: 'tecnico' })
  perfil!: PerfilUsuario;

  @Column({ type: 'text', nullable: true })
  setor?: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;
}
