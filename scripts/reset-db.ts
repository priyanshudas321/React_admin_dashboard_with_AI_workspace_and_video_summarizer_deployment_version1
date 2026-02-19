import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function resetDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  
  console.log('🗑️  Dropping tables...');
  try {
    // Drop known tables
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS audit_log CASCADE`;
    console.log('✨ Tables dropped successfully.');
  } catch (e) {
    console.error('❌ Error dropping tables:', e);
  }
}

resetDb();
