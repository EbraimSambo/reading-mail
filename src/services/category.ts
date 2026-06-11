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
  if (/<[a-z/][^>]*>/i.test(trimmed)) return false;
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false;
  return true;
}

function stripSignature(text: string): string {
  // Remove tudo a partir de linha com só traços (---) ou underscores (___)
  let cleaned = text.replace(/\n[\s]*[-_]{2,}[\s\S]*/i, "");
  // Remove a partir de saudações/fechos comuns
  cleaned = cleaned.replace(/\s*(Atenciosamente|Com os melhores cumprimentos|Cumprimentos|Obrigado|Regards)[\s\S]*/i, "");
  // Remove a partir de "Requisitante:" caso ainda reste
  cleaned = cleaned.replace(/\s*Requisitante\s*:[\s\S]*/i, "");
  return cleaned.trim();
}

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
      bodyDescription || "Solicitação de suporte para sistema não identificado",
  };
}
