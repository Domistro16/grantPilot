import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from './seed';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Data Source initialized');

    await runSeeds(AppDataSource);

    await AppDataSource.destroy();
    console.log('👋 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
