import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// One row per day and endpoint, holding how many requests it received.
// Only counts are stored: no IP addresses, cookies or personal data.
export const requests = pgTable(
  "requests",
  {
    day: text().notNull(),
    endpoint: text().notNull(),
    count: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.day, table.endpoint] })],
);
