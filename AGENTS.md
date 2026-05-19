# Instruções para o Agente AI

Este projeto utiliza **Turso (LibSQL)** como banco de dados em produção e o **Prisma** como ORM. 

## Banco de Dados e Prisma

Devido a limitações do Prisma CLI com o protocolo `libsql://`, **NÃO utilize** o comando `npx prisma db push` diretamente, pois ele falhará pedindo um banco SQLite local (`file:`).

### Sincronização de Schema
Sempre que você alterar o arquivo `prisma/schema.prisma`, você **DEVE** rodar o seguinte comando para sincronizar o banco remoto (Turso) e atualizar o Prisma Client:

```bash
npm run db:push
```

Este comando executa um script customizado em `scripts/sync-db.ts` que:
1. Gera o SQL de migração via `prisma migrate diff`.
2. Aplica o SQL diretamente no Turso usando o `@libsql/client`.
3. Roda `npx prisma generate` para atualizar os tipos.

### Seeds
Se precisar resetar ou popular o banco, utilize:
```bash
npx ts-node prisma/seed.js
```

## Ambiente
- O `DATABASE_URL` no ambiente de desenvolvimento aponta para o seu banco Turso.
- O driver adapter do LibSQL está configurado em `src/lib/prisma.ts`.
