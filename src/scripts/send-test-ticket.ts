import "dotenv/config";
import { sendTicket } from "../services/api-sender.js";

const [,, email, description, category] = process.argv;

if (!email || !description) {
  console.log("Uso: npx tsx src/scripts/send-test-ticket.ts <email> <descricao> [categoria]");
  console.log("");
  console.log("Exemplos:");
  console.log("  npx tsx src/scripts/send-test-ticket.ts teste@exemplo.com \"Preciso de acesso ao sistema\" Primavera");
  console.log("  npx tsx src/scripts/send-test-ticket.ts user@exemplo.com \"Suporte Muxima\" Muxima");
  console.log("  npx tsx src/scripts/send-test-ticket.ts user@exemplo.com \"Preciso de ajuda\" \"Outros sistemas / Serviços\"");
  process.exit(1);
}

const payload = {
  email,
  description,
  category: category || "Outros sistemas / Serviços",
};

console.log("Enviando ticket de teste...");
console.log("Payload:", JSON.stringify(payload, null, 2));

const result = await sendTicket(payload);

if (result) {
  console.log("Ticket enviado com sucesso!");
  console.log("Resposta:", JSON.stringify(result, null, 2));
  process.exit(0);
} else {
  console.log("Falha ao enviar ticket. Verifique o BPM_API_URL e os logs acima.");
  process.exit(1);
}
