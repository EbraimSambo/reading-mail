// emailCategoryParser.ts

export interface EmailCategoryResult {
  category: "Primavera" | "Muxima" | "Outros sistemas / Serviços";
  description: string;
}

// Palavras-chave que indicam um pedido de suporte/permissão
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
  "Muxima",
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
  "crm",
  "CRM",
  "cadastramento",
  "criação",
  "sistema",
  "alteração",
  "alteração",
  "configuração",
  "atualização",
  "atualizações",
  "esqueci",
  "preciso"
];

// Sistemas conhecidos com suas categorias
const SYSTEM_KEYWORDS: { keyword: string; category: "Primavera" | "Muxima"; description: string }[] = [
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

/**
 * Normaliza texto: remove acentos, converte para minúsculas.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Verifica se o texto contém alguma palavra-chave de suporte.
 */
function hasSupportKeyword(text: string): boolean {
  const normalized = normalize(text);
  return SUPPORT_KEYWORDS.some((kw) => normalized.includes(normalize(kw)));
}

/**
 * Valida se o corpo do e-mail é válido, ou seja, se não veio vazio ou distorcido.
 */
function isBodyValid(body: string | undefined | null): boolean {
  if (!body) return false;
  const trimmed = body.trim();
  if (trimmed.length === 0) return false;

  // Evita strings contendo literais de erro comuns
  if (trimmed === "undefined" || trimmed === "null") return false;

  // Verifica se veio como HTML bruto (não convertido)
  if (/<[a-z/][^>]*>/i.test(trimmed)) return false

  // Verifica se contém pelo menos um caractere alfanumérico para evitar strings distorcidas de caracteres especiais
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false

  return true;
}

/**
 * Remove "Atenciosamente" (ou variações) e todo o texto seguinte.
 */
function stripSignature(text: string): string {
  return text.replace(/\s*Atenciosamente[^]*/i, '').trim();
}

/**
 * Analisa o assunto e corpo de um e-mail e retorna a categoria do sistema
 * mencionado, ou null se não for encontrado nenhum padrão relevante.
 *
 * @param subject - Assunto do e-mail
 * @param body    - Corpo do e-mail
 * @returns EmailCategoryResult ou null
 */
export function parseEmailCategory(
  subject: string,
  body: string
): EmailCategoryResult | null {
  const cleanBody = stripSignature(body);
  const fullText = `${subject} ${cleanBody}`;

  // 1. Verifica se há pelo menos uma palavra-chave de suporte/solicitação
  if (!hasSupportKeyword(fullText)) return null;

  const normalizedText = normalize(fullText);
  const useBodyAsDescription = isBodyValid(cleanBody);
  const bodyDescription = useBodyAsDescription ? cleanBody.trim() : null;

  // 2. Verifica se menciona Primavera ou Muxima
  for (const system of SYSTEM_KEYWORDS) {
    if (normalizedText.includes(normalize(system.keyword))) {
      return {
        category: system.category,
        description: bodyDescription || system.description,
      };
    }
  }

  // 3. Tem palavra-chave de suporte mas não é Primavera nem Muxima
  return {
    category: "Outros sistemas / Serviços",
    description: bodyDescription || "Solicitação de suporte para sistema não identificado",
  };
}