import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const verificationCodes = sqliteTable("verification_codes", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
