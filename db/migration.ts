import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '.';

export const migration = async () => {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    // For SQLite with better-sqlite3, closing the database is done via the close method.
};