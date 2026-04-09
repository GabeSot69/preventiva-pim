import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import { Equipamento } from '../entities/Equipamento';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { ItemChecklistPlano } from '../entities/ItemChecklistPlano';
import { ItemChecklistExecucao } from '../entities/ItemChecklistExecucao';

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'preventiva_db',
  synchronize: process.env.TYPEORM_SYNC ? process.env.TYPEORM_SYNC === 'true' : true,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [
    Usuario,
    RefreshToken,
    Equipamento,
    PlanoManutencao,
    ExecucaoManutencao,
    ItemChecklistPlano,
    ItemChecklistExecucao,
  ],
  migrations: [],
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};