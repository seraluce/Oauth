import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
