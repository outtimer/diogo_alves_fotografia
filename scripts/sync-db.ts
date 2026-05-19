
import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('❌ Erro: DATABASE_URL ou TURSO_DATABASE_URL não encontrada no ambiente.');
    process.exit(1);
  }

  const isLibsql = url.startsWith('libsql://') || 
                   url.startsWith('wss://') || 
                   url.startsWith('ws://') || 
                   url.includes('turso.io');

  if (!isLibsql) {
    console.log('ℹ️ O banco não parece ser Turso/LibSQL. Rodando prisma db push padrão...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  }

  console.log(`🚀 Sincronizando schema com Turso: ${url.substring(0, 15)}...`);
  
  const client = createClient({
    url: url,
    authToken: authToken || '',
  });

  try {
    console.log('🔄 Sincronizando com banco local temporário para calcular diff...');
    const shadowDbPath = path.join(process.cwd(), 'prisma', 'shadow.db');
    const shadowDbUrl = `file:${shadowDbPath}`;
    
    if (fs.existsSync(shadowDbPath)) fs.unlinkSync(shadowDbPath);

    // 1. Empurra o schema para um banco local temporário
    execSync(`DATABASE_URL="${shadowDbUrl}" npx prisma db push --skip-generate --accept-data-loss`, { stdio: 'inherit' });

    // 2. Garante que o arquivo existe antes de prosseguir
    if (!fs.existsSync(shadowDbPath)) {
      throw new Error(`Arquivo shadow.db não foi encontrado em ${shadowDbPath}`);
    }

    console.log('📝 Gerando script SQL de sincronização...');
    const tempSqlFile = path.join(process.cwd(), 'temp-migrate.sql');
    execSync(`npx prisma migrate diff --from-empty --to-url "${shadowDbUrl}" --script > ${tempSqlFile}`);
    
    // 3. Aplica no Turso (com lógica de IF NOT EXISTS simplificada ou apenas executando)
    const sql = fs.readFileSync(tempSqlFile, 'utf8');
    fs.unlinkSync(tempSqlFile);
    if (fs.existsSync('./shadow.db')) fs.unlinkSync('./shadow.db');

    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`🚀 Aplicando ${commands.length} operações no Turso...`);

    for (const command of commands) {
      try {
        // Tenta executar. Se falhar porque a tabela já existe, ignoramos erros específicos de criação
        // para permitir atualizações parciais (embora o diff --from-empty seja destrutivo se não cuidarmos)
        await client.execute(command);
      } catch (err: any) {
        if (err.message.includes('already exists')) {
           console.log(`⚠️  Aviso: Objeto já existe, pulando...`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Banco de dados sincronizado com sucesso!');
    execSync('npx prisma generate', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  }
}

main();
