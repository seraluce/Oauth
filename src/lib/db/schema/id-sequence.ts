import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const idSequence = sqliteTable("id_sequence", {
  name: text("name").primaryKey(),
  currentValue: integer("current_value").notNull().default(11999),
});
