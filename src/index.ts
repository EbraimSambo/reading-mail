import { type MailboxObject } from 'imapflow';
import { simpleParser } from 'mailparser'; // 1. Importar o parser
import { client } from './imap-flow.js';
import { registerMail } from './register-mail.js';
import { parseEmailCategory } from './get-category.js';
import { sendApi } from './http.js';
import { server } from './api.js';

async function start() {
  await client.connect();
  console.log('IMAP conectado');
  await client.mailboxOpen('INBOX');
  console.log('Escutando novos emails...');

  client.on('exists', async () => {
    try {
      const mailbox = client.mailbox as MailboxObject;
      const seq = mailbox.exists;

      const message = await client.fetchOne(seq, {
        source: true,
        envelope: true
      });

      if (!message || !message.source) return;
      if (!message.envelope) return;

      const parsedEmail = await simpleParser(message.source);
      const emailBody = parsedEmail.text || '';

      // ✅ Detectar se é uma resposta (reply)
      const isReply =
        !!parsedEmail.headers.get('in-reply-to') ||
        !!parsedEmail.headers.get('references') ||
        /^(re|res|fw|fwd|enc)\s*:/i.test(message.envelope.subject || '');

      if (isReply) {
        console.log('Email ignorado: é uma resposta/encaminhamento.');
        return;
      }

      console.log('Novo e-mail recebido!');
      console.log('Assunto:', message.envelope.subject);
      console.log('Corpo extraído:', emailBody);

      await registerMail(message.envelope, message.id as string);

      const formate = parseEmailCategory(
        message.envelope.subject || '',
        emailBody
      );

      if (formate) {
        console.log('Categoria identificada: ', formate);
        sendApi({
          email: message.envelope.from?.[0]?.address || '',
          description: formate.description,
          category: formate.category
        });
      } else {
        console.log('Nenhuma categoria identificada para este email.');
      }
    } catch (err) {
      console.error('Erro ao processar e-mail:', err);
    }
  });
}

start();
server 