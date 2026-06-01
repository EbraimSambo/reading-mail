import type { MessageEnvelopeObject } from "imapflow";
import { dbClient, usersTable } from "./drizzle.schema.js";




export async function registerMail(body: MessageEnvelopeObject, messageId: string) {
const [result] = await dbClient.insert(usersTable).values({
    idMail: messageId,
    name: body.from?.[0]?.name || 'Sem nome',
    email: body.from?.[0]?.address || '',
    subject: body.subject || '',
  }).returning();
  console.log('Registering mail...', result);
}