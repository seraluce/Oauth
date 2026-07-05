import { drizzle as drizzleSqlite, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb() {
  if (_db) return _db;

  const dbUrl = process.env.DATABASE_URL || "file:./local.db";
  const dbPath = dbUrl.replace("file:", "");

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  _db = drizzleSqlite(sqlite, { schema });
  return _db;
}

export type Database = BetterSQLite3Database<typeof schema>;
