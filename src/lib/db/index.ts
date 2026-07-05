import * as schema from "./schema";

type DbInstance = any;

let _db: DbInstance = null;
let _driver: string | null = null;

export async function getDb(): Promise<DbInstance> {
  const driver = process.env.DB_DRIVER || "sqlite";

  if (_db && _driver === driver) return _db;

  if (driver === "d1") {
    const [{ getCloudflareContext }, { drizzle: drizzleD1 }] = await Promise.all([
      import("@opennextjs/cloudflare" as string),
      import("drizzle-orm/d1" as string),
    ]);
    const { env } = getCloudflareContext();
    _db = drizzleD1(env.DB, { schema });
  } else {
    const [{ default: Database }, { drizzle: drizzleSqlite }] = await Promise.all([
      import("better-sqlite3" as string),
      import("drizzle-orm/better-sqlite3" as string),
    ]);
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    const dbPath = dbUrl.replace("file:", "");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    _db = drizzleSqlite(sqlite, { schema });
  }

  _driver = driver;
  return _db;
}
