import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const oauthAccounts = sqliteTable(
  "oauth_accounts",
  {
    id: integer("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("oauth_provider_idx").on(table.provider, table.providerAccountId),
  ]
);
