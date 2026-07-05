import { hash } from "bcryptjs";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

async function seed() {
  const dbUrl = process.env.DATABASE_URL || "file:./local.db";
  const dbPath = dbUrl.replace("file:", "");

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  const adminExists = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, 11000))
    .all();

  if (adminExists.length > 0) {
    console.log("Admin account already exists (ID: 11000)");
    return;
  }

  const passwordHash = await hash("admin123456", 12);
  const now = new Date();

  db.insert(schema.users)
    .values({
      id: 11000,
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
      status: "active",
      emailVerifiedAt: now,
      displayName: "System Administrator",
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  db.insert(schema.userSettings)
    .values({
      userId: 11000,
      theme: "system",
      locale: "en",
      twoFactorEnabled: false,
      emailNotifications: true,
      updatedAt: now,
    })
    .run();

  db.insert(schema.idSequence)
    .values({
      name: "user_id",
      currentValue: 11999,
    })
    .run();

  console.log("Seed completed:");
  console.log("  Admin account created (ID: 11000, email: admin@example.com, password: admin123456)");
  console.log("  ID sequence initialized at 11999");
}

seed().catch(console.error);
