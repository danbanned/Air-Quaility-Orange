import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  adapter: () => {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaLibSql(libsql);
  },
});
