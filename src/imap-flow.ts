import { ImapFlow } from "imapflow";

const host = "mail.grupoboavida.co.ao"
const port = 993
const secure = true
const user = "bpm.suporte@grupoboavida.co.ao";
const pass = "GBV!d@2023bsuporte#";

export const client = new ImapFlow({
    host,
    port,
    secure,
    auth: {
        user,
        pass
    }
});