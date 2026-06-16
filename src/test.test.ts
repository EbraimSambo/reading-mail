import { describe, it, expect } from "vitest";
import { stripSignature } from "./services/category.js";

describe("stripSignature", () => {
  it("remove bloco após linha de traços", () => {
    const input = "Preciso de acesso ao sistema\n--------------------\nRequisitante: João\nTelefone: 123";
    expect(stripSignature(input)).toBe("Preciso de acesso ao sistema");
  });

  it("remove bloco após linha de underscores", () => {
    const input = "Solicito suporte urgente\n____________________\nEmpresa: XPTO";
    expect(stripSignature(input)).toBe("Solicito suporte urgente");
  });

  it("remove a partir de Requisitante sem linha de traços", () => {
    const input = "Olá, preciso de ajuda\nRequisitante: Maria\nDepartamento: TI";
    expect(stripSignature(input)).toBe("Olá, preciso de ajuda");
  });

  it("remove fecho Atenciosamente nas últimas linhas", () => {
    const input = "Boa tarde,\nPreciso de suporte para o sistema.\nAtenciosamente";
    expect(stripSignature(input)).toBe("Boa tarde,\nPreciso de suporte para o sistema.");
  });

  it("remove fecho Com os melhores cumprimentos", () => {
    const input = "Solicito acesso ao CRM.\nCom os melhores cumprimentos";
    expect(stripSignature(input)).toBe("Solicito acesso ao CRM.");
  });

  it("remove fecho Cumprimentos", () => {
    const input = "Preciso de suporte.\nCumprimentos";
    expect(stripSignature(input)).toBe("Preciso de suporte.");
  });

  it("remove fecho Obrigado", () => {
    const input = "Por favor, reponham o acesso.\nObrigado";
    expect(stripSignature(input)).toBe("Por favor, reponham o acesso.");
  });

  it("nao remove fecho quando esta no meio do texto", () => {
    const input = "Atenciosamente aguardo retorno.\nPreciso de suporte.\nPor favor ajudem.";
    expect(stripSignature(input)).toContain("Atenciosamente aguardo retorno.");
  });

  it("retorna texto limpo quando nao ha assinatura", () => {
    const input = "Preciso de suporte para instalacao do sistema Primavera.";
    expect(stripSignature(input)).toBe(input);
  });

  it("remove espacos e linhas em branco no final", () => {
    const input = "Preciso de ajuda.   \n\n";
    expect(stripSignature(input)).toBe("Preciso de ajuda.");
  });

  it("lida com tracos de tamanho minimo 3 caracteres", () => {
    const input = "Texto principal\n---\nAssinatura aqui";
    expect(stripSignature(input)).toBe("Texto principal");
  });
});
