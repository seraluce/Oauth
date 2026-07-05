import {
  sqliteTable,
  integer as sqliteInteger,
  text as sqliteText,
} from "drizzle-orm/sqlite-core";
import {
  mysqlTable,
  int as mysqlInteger,
  varchar as mysqlText,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import {
  pgTable,
  integer as pgInteger,
  text as pgText,
  pgEnum,
} from "drizzle-orm/pg-core";

export type DbDriver = "sqlite" | "mysql" | "postgres";

export function getDbDriver(): DbDriver {
  return (process.env.DB_DRIVER as DbDriver) || "sqlite";
}

let _enumCounter = 0;

export function createTable(name: string) {
  const driver = getDbDriver();
  switch (driver) {
    case "mysql":
      return mysqlTable(name, () => ({}));
    case "postgres":
      return pgTable(name, () => ({}));
    default:
      return sqliteTable(name, () => ({}));
  }
}

export function integer(columnName: string) {
  const driver = getDbDriver();
  switch (driver) {
    case "mysql":
      return mysqlInteger(columnName);
    case "postgres":
      return pgInteger(columnName);
    default:
      return sqliteInteger(columnName);
  }
}

export function text(columnName: string) {
  const driver = getDbDriver();
  switch (driver) {
    case "mysql":
      return mysqlText(columnName, { length: 191 });
    case "postgres":
      return pgText(columnName);
    default:
      return sqliteText(columnName);
  }
}

export function textLong(columnName: string) {
  const driver = getDbDriver();
  switch (driver) {
    case "mysql":
      return mysqlText(columnName, { length: 4096 });
    case "postgres":
      return pgText(columnName);
    default:
      return sqliteText(columnName);
  }
}

export function enumColumn<T extends string>(
  columnName: string,
  values: [T, ...T[]],
) {
  const driver = getDbDriver();
  switch (driver) {
    case "mysql":
      return mysqlEnum(columnName, values);
    case "postgres": {
      const enumName = `enum_${columnName}_${_enumCounter++}`;
      const e = pgEnum(enumName, values);
      return pgText(columnName);
    }
    default:
      return sqliteText(columnName);
  }
}

export { sqliteTable, mysqlTable, pgTable };
