import { ImapFlow } from "imapflow";

export const client = new ImapFlow({
    host: 'mail.muximaboavida.co.ao',
    port: 993,
    secure: true,

    auth: {
        user: 'tickets@muximaboavida.co.ao',
        pass: 'Angola@2026!#'
    }
});