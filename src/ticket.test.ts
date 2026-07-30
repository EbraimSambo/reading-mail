import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseEmailCategory } from "./services/category.js";

const { mockPost, mockGetEnv } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGetEnv: vi.fn((key: string, fallback: string) => {
    if (key === "BPM_API_URL") {
      return process.env.BPM_API_URL || fallback;
    }
    return fallback;
  }),
}));

vi.mock("axios", () => ({
  default: {
    post: mockPost,
    isAxiosError: (err: unknown): boolean =>
      (err as { isAxios?: boolean })?.isAxios === true,
  },
}));

vi.mock("./config/env.js", () => ({
  getEnv: mockGetEnv,
}));

import { sendTicket } from "./services/api-sender.js";

describe("sendTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia ticket com payload correto e retorna dados da resposta", async () => {
    const mockResponse = { data: { id: 123, status: "criado" } };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await sendTicket({
      email: "ebraim.sambo@grupoboavida.co.ao",
      description: "Preciso de acesso ao Primavera",
      category: "Primavera",
    });

    expect(mockPost).toHaveBeenCalledOnce();
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("bpm/ticket"),
      {
        categoria: "Primavera",
        descricao: "Preciso de acesso ao Primavera",
        email_requisitante: "teste@exemplo.com",
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("retorna null quando a API retorna erro", async () => {
    mockPost.mockRejectedValueOnce({
      isAxios: true,
      response: { data: { error: "erro interno" } },
      message: "Request failed",
    });

    const result = await sendTicket({
      email: "erro@exemplo.com",
      description: "Teste de erro",
      category: "Muxima",
    });

    expect(result).toBeNull();
  });

  it("retorna null em caso de erro inesperado", async () => {
    mockPost.mockRejectedValueOnce(new Error("network error"));

    const result = await sendTicket({
      email: "falha@exemplo.com",
      description: "Teste de falha",
      category: "Outros sistemas / Serviços",
    });

    expect(result).toBeNull();
  });

  it("usa a URL base da configuracao", async () => {
    mockPost.mockResolvedValueOnce({ data: { ok: true } });

    await sendTicket({
      email: "url@teste.com",
      description: "Teste de URL",
      category: "Primavera",
    });

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("bpm/ticket"),
      expect.any(Object)
    );
  });
});

describe("parseEmailCategory", () => {
  it("retorna categoria Primavera quando assunto contém 'primavera'", () => {
    const result = parseEmailCategory("Problema no Primavera", "Preciso de ajuda");
    expect(result).toEqual({
      category: "Primavera",
      description: "Preciso de ajuda",
    });
  });

  it("retorna categoria Muxima quando corpo contém 'muxima'", () => {
    const result = parseEmailCategory("Solicito suporte", "Sistema Muxima não abre");
    expect(result).toEqual({
      category: "Muxima",
      description: "Sistema Muxima não abre",
    });
  });

  it("retorna Outros sistemas quando não identifica sistema específico", () => {
    const result = parseEmailCategory("Pedido de acesso", "Preciso de acesso ao CRM");
    expect(result).toEqual({
      category: "Outros sistemas / Serviços",
      description: "Preciso de acesso ao CRM",
    });
  });

  it("retorna null quando não há palavra-chave de suporte", () => {
    const result = parseEmailCategory("Reunião agendada", "Confirmo presença na reunião");
    expect(result).toBeNull();
  });

  it("usa descrição padrão quando corpo é inválido (HTML)", () => {
    const result = parseEmailCategory("Suporte Primavera", "<html><body>teste</body></html>");
    expect(result).toEqual({
      category: "Primavera",
      description: "Suporte ao sistema Primavera (ERP/Gestão)",
    });
  });

  it("usa descrição padrão quando corpo está vazio", () => {
    const result = parseEmailCategory("Muxima", "");
    expect(result).toEqual({
      category: "Muxima",
      description: "Suporte ao sistema Muxima",
    });
  });

  it("remove assinatura antes de classificar", () => {
    const result = parseEmailCategory(
      "Suporte",
      "Preciso de ajuda com o sistema\n--------------------\nAssinatura qualquer"
    );
    expect(result?.description).not.toContain("Assinatura");
  });
});
