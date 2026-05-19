import { createClient } from '@libsql/client';

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.log('DATABASE_URL not set');
    return;
  }

  console.log('Connecting to:', url.substring(0, 20));
  const client = createClient({ url, authToken: authToken || "" });

  try {
    const res = await client.execute("PRAGMA table_info(HomeConfig)");
    console.log('HomeConfig columns:', res.rows.map(r => r.name));
    
    const aboutRes = await client.execute("PRAGMA table_info(AboutConfig)");
    console.log('AboutConfig columns:', aboutRes.rows.map(r => r.name));

    const contactRes = await client.execute("PRAGMA table_info(ContactConfig)");
    console.log('ContactConfig columns:', contactRes.rows.map(r => r.name));
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
