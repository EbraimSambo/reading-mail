import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

export const usersTable = sqliteTable("receivers_mails", {
  id: int().primaryKey({ autoIncrement: true }),
  idMail: text().notNull().unique(),
  name: text().notNull(),
  email: text().notNull(),
  subject: text().notNull(),
  createdAt: text().notNull().$default(() => new Date().toISOString())
});


export const dbClient = drizzle(createClient({
  url: 'file:./db.sqlite',
}));
