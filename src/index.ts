import type { MailboxObject } from "imapflow";
import { simpleParser } from "mailparser";
import { imapClient } from "./services/imap.js";
import "./api.js";
import { registerMail } from "./services/mail-register.js";
import { parseEmailCategory } from "./services/category.js";
import { sendTicket } from "./services/api-sender.js";

async function start() {
  await imapClient.connect();
  await imapClient.mailboxOpen("INBOX");
  console.log("IMAP conectado — escutando novos e-mails...");

  imapClient.on("exists", async () => {
    try {
      const seq = (imapClient.mailbox as MailboxObject).exists;

      const message = await imapClient.fetchOne(seq, {
        source: true,
        envelope: true,
      });

      if (!message || !message.source || !message.envelope) return;

      const parsed = await simpleParser(message.source);
      const body = parsed.text || "";
      const subject = message.envelope.subject || "";

      const isReply =
        !!parsed.headers.get("in-reply-to") ||
        !!parsed.headers.get("references") ||
        /^(re|res|fw|fwd|enc)\s*:/i.test(subject);

      if (isReply) {
        console.log("E-mail ignorado: é uma resposta/encaminhamento.");
        return;
      }

      console.log("Novo e-mail recebido —", subject);

      await registerMail(message.envelope, String(message.id));

      const category = parseEmailCategory(subject, body);
      if (!category) {
        console.log("Nenhuma categoria identificada.");
        return;
      }

      console.log("Categoria:", category.category);
      await sendTicket({
        email: message.envelope.from?.[0]?.address || "",
        description: category.description,
        category: category.category,
      });
    } catch (err) {
      console.error("Erro ao processar e-mail:", err);
    }
  });
}

start();
