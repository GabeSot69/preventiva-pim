import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import { Equipamento } from '../entities/Equipamento';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { ItemChecklistPlano } from '../entities/ItemChecklistPlano';
import { ItemChecklistExecucao } from '../entities/ItemChecklistExecucao';
import { Perfil } from '../entities/Perfil';
import { StatusExecucao } from '../entities/StatusExecucao';

export const AppDataSource = new DataSource({
  type: env.DB_TYPE as any,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  // Desativa auto-sync em teste para controle manual no beforeAll
  synchronize: env.NODE_ENV === 'test' ? false : (env.NODE_ENV !== 'production'),
  logging: env.TYPEORM_LOGGING,
  entities: [
    Usuario,
    RefreshToken,
    Equipamento,
    PlanoManutencao,
    ExecucaoManutencao,
    ItemChecklistPlano,
    ItemChecklistExecucao,
    Perfil,
    StatusExecucao,
  ],
  migrations: [],
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};
