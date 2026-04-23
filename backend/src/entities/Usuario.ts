import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Perfil } from './Perfil';
import { RefreshToken } from './RefreshToken';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  nome!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', select: false })
  senha_hash!: string;

  @ManyToOne(() => Perfil, { nullable: true })
  perfil!: Perfil;

  @Column({ type: 'text', nullable: true })
  setor?: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({ type: 'boolean', default: false })
  trocar_senha!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm!: Date;

  @OneToMany(() => RefreshToken, (token) => token.usuario)
  refresh_tokens!: RefreshToken[];

  toResponse() {
    const { senha_hash, refresh_tokens, ...publicData } = this;
    return publicData;
  }
}
