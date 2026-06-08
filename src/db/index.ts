import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { emailsTable } from "./schema.js";

const client = createClient({
  url: process.env.DB_URL ?? "file:./db.sqlite",
});

export const db = drizzle(client);

export { emailsTable };
