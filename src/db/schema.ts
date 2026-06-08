import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const emailsTable = sqliteTable("receivers_mails", {
  id: int().primaryKey({ autoIncrement: true }),
  idMail: text().notNull().unique(),
  name: text().notNull(),
  email: text().notNull(),
  subject: text().notNull(),
  createdAt: text().notNull().$default(() => new Date().toISOString()),
});
