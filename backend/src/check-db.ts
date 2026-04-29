import { AppDataSource } from './database';
import { Perfil } from './entities/Perfil';

async function check() {
  await AppDataSource.initialize();
  const perfis = await AppDataSource.getRepository(Perfil).find();
  console.log('Perfis no banco:', JSON.stringify(perfis, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
