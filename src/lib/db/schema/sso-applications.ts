import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const ssoApplications = sqliteTable("sso_applications", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull(),
  clientSecretHash: text("client_secret_hash").notNull(),
  ownerUserId: integer("owner_user_id")
    .notNull()
    .references(() => users.id),
  redirectUris: text("redirect_uris").notNull(),
  scopes: text("scopes").notNull().default("openid profile email"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
