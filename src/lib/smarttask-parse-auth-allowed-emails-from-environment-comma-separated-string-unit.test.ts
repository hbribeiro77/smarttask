import { describe, expect, it } from "vitest";
import {
  parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString,
} from "@/lib/smarttask-parse-auth-allowed-emails-from-environment-comma-separated-string";

describe("parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString", () => {
  it("retorna vazio para undefined ou string vazia", () => {
    expect(
      parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString(undefined).size
    ).toBe(0);
    expect(parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString("").size).toBe(
      0
    );
  });

  it("separa por vírgula, ponto-e-vírgula ou quebra de linha e normaliza", () => {
    const s = parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString(
      " A@X.COM , b@y.com;\nc@z.org "
    );
    expect(s.has("a@x.com")).toBe(true);
    expect(s.has("b@y.com")).toBe(true);
    expect(s.has("c@z.org")).toBe(true);
    expect(s.size).toBe(3);
  });
});
