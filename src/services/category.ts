export interface EmailCategoryResult {
  category: "Primavera" | "Muxima" | "Outros sistemas / Serviços";
  description: string;
}

const SUPPORT_KEYWORDS = [
  "solicitacao",
  "solicitação",
  "suporte",
  "pedido",
  "pedido de suporte",
  "permissao",
  "permissão",
  "permissoes",
  "permissões",
  "primavera",
  "muxima",
  "cadastramento",
  "bloqueio",
  "desbloqueio",
  "servidor",
  "configuração",
  "dados",
  "informação",
  "informações",
  "instalação",
  "instalações",
  "acessos",
  "acesso",
  "criação",
  "sistema",
  "alteração",
  "atualização",
  "atualizações",
  "esqueci",
  "preciso",
  "crm",
];

const SYSTEM_KEYWORDS: {
  keyword: string;
  category: "Primavera" | "Muxima";
  description: string;
}[] = [
  {
    keyword: "primavera",
    category: "Primavera",
    description: "Suporte ao sistema Primavera (ERP/Gestão)",
  },
  {
    keyword: "muxima",
    category: "Muxima",
    description: "Suporte ao sistema Muxima",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasSupportKeyword(text: string): boolean {
  const normalized = normalize(text);
  return SUPPORT_KEYWORDS.some((kw) => normalized.includes(normalize(kw)));
}

function isBodyValid(body: string | undefined | null): boolean {
  if (!body) return false;
  const trimmed = body.trim();
  if (trimmed.length === 0) return false;
  if (trimmed === "undefined" || trimmed === "null") return false;
  // Rejeita se parecer HTML
  if (/<[a-z/][^>]*>/i.test(trimmed)) return false;
  // Rejeita se não tiver nenhum alfanumérico
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false;
  return true;
}

/**
 * Remove a assinatura do corpo do e-mail, preservando o conteúdo principal.
 *
 * Lida com padrões como:
 *   - Sequências longas de traços/underscores (ex: "--------------------")
 *   - Bloco "Requisitante: ..." após os traços
 *   - Fechos comuns apenas quando aparecem nas últimas 3 linhas
 */
function stripSignature(text: string): string {
  // 1. Remove tudo a partir de uma linha composta APENAS por traços ou underscores
  //    (mínimo 3 caracteres, suporta sequências longas como "--------------------")
  let cleaned = text.replace(
    /(^|\n)[^\S\n]*[-_]{3,}[^\S\n]*(\n|$)[\s\S]*/i,
    ""
  );

  // 2. Remove a partir de "Requisitante:" caso ainda reste (ex: sem linha de traços)
  cleaned = cleaned.replace(/\n?[^\S\n]*Requisitante\s*:[\s\S]*/i, "");

  // 3. Remove fechos comuns APENAS se estiverem nas últimas 3 linhas
  //    (evita remover "Com os melhores cumprimentos" no meio do corpo)
  const closingPattern =
    /^\s*(Atenciosamente|Com os melhores cumprimentos|Cumprimentos|Obrigado|Regards)\s*$/i;

  const lines = cleaned.split("\n");
  let cutIndex = -1;
  const searchFrom = Math.max(0, lines.length - 3);

  for (let i = searchFrom; i < lines.length; i++) {
    if (closingPattern.test(lines[i] ?? "")) {
      cutIndex = i;
      break;
    }
  }

  if (cutIndex !== -1) {
    cleaned = lines.slice(0, cutIndex).join("\n");
  }

  // 4. Remove espaços/linhas em branco finais
  return cleaned.replace(/\s+$/, "").trim();
}

// ─── Export principal ────────────────────────────────────────────────────────

export function parseEmailCategory(
  subject: string,
  body: string
): EmailCategoryResult | null {
  const cleanBody = stripSignature(body);
  const fullText = `${subject} ${cleanBody}`;

  if (!hasSupportKeyword(fullText)) return null;

  const normalizedText = normalize(fullText);
  const useBodyAsDescription = isBodyValid(cleanBody);
  const bodyDescription = useBodyAsDescription ? cleanBody.trim() : null;

  for (const system of SYSTEM_KEYWORDS) {
    if (normalizedText.includes(normalize(system.keyword))) {
      return {
        category: system.category,
        description: bodyDescription || system.description,
      };
    }
  }

  return {
    category: "Outros sistemas / Serviços",
    description:
      bodyDescription ||
      "Solicitação de suporte para sistema não identificado",
  };
}