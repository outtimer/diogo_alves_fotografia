import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null);
const authToken = process.env.TURSO_AUTH_TOKEN;

let prismaInstance: PrismaClient;

if (url && url.startsWith('libsql://')) {
  console.log('Initializing Prisma with LibSQL adapter (Turso)');
  try {
    const libsql = createClient({ url, authToken: authToken || "" });
    const adapter = new PrismaLibSQL(libsql);
    prismaInstance = new PrismaClient({ adapter } as any);
  } catch (err) {
    console.error('Failed to initialize LibSQL adapter:', err);
    // Fallback to standard client if adapter fails - though it might still fail if URL is wrong
    prismaInstance = new PrismaClient();
  }
} else {
  console.log('Initializing Prisma with local SQLite');
  // Garantir que estamos usando o arquivo absoluto no diretório prisma
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  } as any);
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
