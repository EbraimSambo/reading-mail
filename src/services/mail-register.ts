import type { MessageEnvelopeObject } from "imapflow";
import { db, emailsTable } from "../db/index.js";

export async function registerMail(
  envelope: MessageEnvelopeObject,
  messageId: string
) {
  const [result] = await db
    .insert(emailsTable)
    .values({
      idMail: messageId,
      name: envelope.from?.[0]?.name || "Sem nome",
      email: envelope.from?.[0]?.address || "",
      subject: envelope.subject || "",
    })
    .returning();

  console.log("E-mail registrado:", result);
}
