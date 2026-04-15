import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './Usuario';

@Entity({ name: 'perfil_usuario' })
export class Perfil {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  chave!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @OneToMany(() => Usuario, (u) => u.perfil)
  usuarios!: Usuario[];
}
