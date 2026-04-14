import { describe, expect, it } from "vitest";
import {
  createSmarttaskPasswordAuthSignedSessionToken,
  verifySmarttaskPasswordAuthSignedSessionToken,
} from "@/lib/smarttask-password-auth-signed-session-token-webcrypto-hmac-sha256";

const SECRET = "unit-test-session-secret-min-32-characters";

describe("smarttask password auth session token", () => {
  it("cria e valida token", async () => {
    const t = await createSmarttaskPasswordAuthSignedSessionToken(SECRET);
    const v = await verifySmarttaskPasswordAuthSignedSessionToken(t, SECRET);
    expect(v.ok).toBe(true);
    if (v.ok) {
      const v2 = await verifySmarttaskPasswordAuthSignedSessionToken(v.refreshedToken, SECRET);
      expect(v2.ok).toBe(true);
    }
  });

  it("rejeita segredo errado ou token adulterado", async () => {
    const t = await createSmarttaskPasswordAuthSignedSessionToken(SECRET);
    const bad = await verifySmarttaskPasswordAuthSignedSessionToken(t, SECRET + "x");
    expect(bad.ok).toBe(false);
    const tampered = t.slice(0, -2) + "xx";
    const bad2 = await verifySmarttaskPasswordAuthSignedSessionToken(tampered, SECRET);
    expect(bad2.ok).toBe(false);
  });

  it("rejeita token expirado", async () => {
    const base = Date.now() - 40 * 24 * 60 * 60 * 1000;
    const t = await createSmarttaskPasswordAuthSignedSessionToken(SECRET, base);
    const v = await verifySmarttaskPasswordAuthSignedSessionToken(t, SECRET);
    expect(v.ok).toBe(false);
  });
});
