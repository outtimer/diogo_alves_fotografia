import { createClient } from '@libsql/client';

async function main() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('DATABASE_URL not set');
    return;
  }

  const client = createClient({ url, authToken: authToken || "" });

  console.log('Fixed columns in Turso...');

  const commands = [
    // HomeConfig
    "ALTER TABLE HomeConfig ADD COLUMN mainText TEXT",
    
    // AboutConfig (Renaming/Migrating columns is harder in SQLite, so we recreate if it's small config)
    // Actually, AboutConfig columns changed completely.
    "DROP TABLE AboutConfig",
    "CREATE TABLE AboutConfig (id TEXT PRIMARY KEY DEFAULT 'default', greeting TEXT, titleNormal TEXT, titleStyled TEXT, bio TEXT, years TEXT, equipment TEXT, address TEXT, linkText TEXT, photoUrl TEXT)",
    
    // ContactConfig
    "DROP TABLE ContactConfig",
    "CREATE TABLE ContactConfig (id TEXT PRIMARY KEY DEFAULT 'default', titleNormal TEXT, titleStyled TEXT, subtitle TEXT, infoTitle TEXT, infoDesc TEXT, email TEXT)"
  ];

  for (const cmd of commands) {
    try {
      console.log(`Executing: ${cmd}`);
      await client.execute(cmd);
    } catch (e: any) {
      console.warn(`Warning/Error executing ${cmd}: ${e.message}`);
    }
  }
}

main();
