import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from './Usuario';

@Entity({ name: 'refresh_token' })
@Index(['token'], { unique: true })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  token!: string;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Usuario;

  @Column({ type: 'timestamptz', nullable: true })
  expiraEm?: Date;

  @Column({ type: 'boolean', default: false })
  revogado!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  revogadoEm?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm!: Date;
}
