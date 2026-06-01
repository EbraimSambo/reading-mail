import { ImapFlow } from "imapflow";

export const client = new ImapFlow({
    host: "mail.grupoboavida.co.ao",
    port: 993,
    secure: true,
    auth: {
        user: "bpm.suporte@grupoboavida.co.ao",
        pass: 'GBV!d@2023bsuporte#'
    }
});