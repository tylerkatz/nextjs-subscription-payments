import { config } from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';
import toml from '@iarna/toml';
import pg from 'pg';

// Load environment variables
config({ path: resolve(__dirname, '../../.env.local') });

interface DbConfig {
  db?: {
    seed?: {
      enabled: boolean;
      sql_paths: string[];
    };
  };
}

async function getSeedFiles(): Promise<string[]> {
  try {
    const configPath = resolve(__dirname, '../../supabase/config.toml');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const parsedConfig = toml.parse(configContent) as DbConfig;
    
    if (parsedConfig.db?.seed?.enabled && parsedConfig.db.seed.sql_paths) {
      return parsedConfig.db.seed.sql_paths;
    }
  } catch (error) {
    console.warn('No seed configuration found in config.toml');
  }
  
  return ['seed.sql'];
}

async function seedDatabase() {
  const client = new pg.Client({
    host: 'localhost',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    const seedFiles = await getSeedFiles();
    const supabasePath = resolve(__dirname, '../../supabase');
    
    for (const file of seedFiles.sort()) {
      try {
        const sqlPath = resolve(supabasePath, file);
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        
        console.log(`Executing ${file}...`);
        await client.query(sql);
        console.log(`Successfully executed ${file}`);
      } catch (error) {
        console.error(`Error executing ${file}:`, error);
        process.exit(1);
      }
    }
  } finally {
    await client.end();
  }
}

seedDatabase().catch(console.error); 