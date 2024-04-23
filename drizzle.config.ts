import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schemas.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH || './sqlite.db',
  },
} satisfies Config;