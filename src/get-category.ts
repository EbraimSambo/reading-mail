// emailCategoryParser.ts

export interface EmailCategoryResult {
  category: "Primavera" | "Muxima" | "Outros suportes / Serviços";
  description: string;
}

// Palavras-chave que indicam um pedido de suporte/permissão
const SUPPORT_KEYWORDS = [
  "solicitacao",
  "solicitação",
  "suporte",
  "pedido de suporte",
  "permissao",
  "permissão",
  "permissoes",
  "permissões",
  "primavera",
  "muxima"
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
  const fullText = `${subject} ${body}`;

  // 1. Verifica se há pelo menos uma palavra-chave de suporte/solicitação
  if (!hasSupportKeyword(fullText)) {
    return null;
  }

  const normalizedText = normalize(fullText);

  // 2. Verifica se menciona Primavera ou Muxima
  for (const system of SYSTEM_KEYWORDS) {
    if (normalizedText.includes(normalize(system.keyword))) {
      return {
        category: system.category,
        description: system.description,
      };
    }
  }

  // 3. Tem palavra-chave de suporte mas não é Primavera nem Muxima
  return {
    category: "Outros suportes / Serviços",
    description: "Solicitação de suporte para sistema não identificado",
  };
}