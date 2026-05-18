import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null);
const authToken = process.env.TURSO_AUTH_TOKEN;

let prismaInstance: PrismaClient;

if (url && url.startsWith('libsql://')) {
  // Se temos a URL mas não o token, e a URL já contém o token (raro) ou estamos em dev sem token
  const libsql = createClient({ url, authToken: authToken || "" });
  const adapter = new PrismaLibSQL(libsql);
  prismaInstance = new PrismaClient({ adapter } as any);
} else {
  // Garantir que estamos usando o arquivo absoluto no diretório prisma
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
    log: ['query'],
  } as any);
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
