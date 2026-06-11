import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { emailsTable } from "./schema.js";
import { getEnv } from "../config/env.js";

const client = createClient({
  url: getEnv("DB_URL","file:./db.sqlite"),
});

export const db = drizzle(client);

export { emailsTable };
