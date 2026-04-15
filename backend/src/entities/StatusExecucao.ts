import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ExecucaoManutencao } from './ExecucaoManutencao';

@Entity({ name: 'status_execucao' })
export class StatusExecucao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  chave!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @OneToMany(() => ExecucaoManutencao, (e) => e.status)
  execucoes!: ExecucaoManutencao[];
}
