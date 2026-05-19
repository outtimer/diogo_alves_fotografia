import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prismaInstance: PrismaClient;

const isLibsql = url && (
  url.startsWith('libsql://') || 
  url.startsWith('wss://') || 
  url.startsWith('ws://') || 
  url.includes('turso.io')
);

if (isLibsql) {
  console.log('Initializing Prisma with LibSQL adapter (Turso)');
  try {
    const libsql = createClient({ url: url!, authToken: authToken || "" });
    const adapter = new PrismaLibSQL(libsql);
    prismaInstance = new PrismaClient({ adapter } as any);
  } catch (err) {
    console.error('Failed to initialize LibSQL adapter:', err);
    prismaInstance = new PrismaClient();
  }
} else {
  console.log('Initializing Prisma with standard driver (SQLite local)');
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
