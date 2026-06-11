import { ImapFlow } from "imapflow";
import { getEnv } from "../config/env.js";

const host = getEnv("IMAP_HOST", "mail.grupoboavida.co.ao");
const port = Number(process.env.IMAP_PORT ?? "993");
const secure = process.env.IMAP_SECURE !== "false";
const user = getEnv("IMAP_USER", "bpm.suporte@grupoboavida.co.ao");
const pass = getEnv("IMAP_PASS", "GBV!d@2023bsuporte#");

export const imapClient = new ImapFlow({
  host,
  port,
  secure,
  auth: { user, pass },
});
