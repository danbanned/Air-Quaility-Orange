import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Connecting to:', process.env.TURSO_DATABASE_URL);

const statements = [
  'ALTER TABLE "Story" ADD COLUMN "streetName" TEXT',
  'ALTER TABLE "Story" ADD COLUMN "lat" REAL',
  'ALTER TABLE "Story" ADD COLUMN "lng" REAL',
  'ALTER TABLE "Story" ADD COLUMN "height" REAL',
  'ALTER TABLE "Story" ADD COLUMN "characterColor" TEXT',
  'ALTER TABLE "Story" ADD COLUMN "modelUri" TEXT',
];

for (const sql of statements) {
  try {
    await client.execute(sql);
    console.log('OK:', sql);
  } catch (err) {
    if (err.message?.includes('duplicate column name') || err.message?.includes('already exists')) {
      console.log('SKIP (already exists):', sql);
    } else {
      console.error('FAIL:', sql);
      console.error('Error details:', err);
      process.exit(1);
    }
  }
}

console.log('Migration complete.');
