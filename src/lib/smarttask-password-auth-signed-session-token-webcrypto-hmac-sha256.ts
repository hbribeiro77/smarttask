export const SMARTTASK_SESSION_COOKIE_NAME = "smarttask_sess";
/** 30 dias em milissegundos (renovação deslizante a cada request autenticado). */
export const SMARTTASK_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  const b64 = btoa(s);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(b64url: string): Uint8Array | null {
  try {
    const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)!;
    return out;
  } catch {
    return null;
  }
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i]! ^ b[i]!;
  return x === 0;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function hmacSha256Raw(secret: string, payload: string): Promise<Uint8Array> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return new Uint8Array(sig);
}

export async function createSmarttaskPasswordAuthSignedSessionToken(
  secret: string,
  nowMs: number = Date.now()
): Promise<string> {
  const exp = nowMs + SMARTTASK_SESSION_DURATION_MS;
  const body = JSON.stringify({ exp });
  const payload = bytesToBase64Url(new TextEncoder().encode(body));
  const sigBytes = await hmacSha256Raw(secret, payload);
  const sig = bytesToBase64Url(sigBytes);
  return `${payload}.${sig}`;
}

export async function verifySmarttaskPasswordAuthSignedSessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number = Date.now()
): Promise<{ ok: true; refreshedToken: string } | { ok: false }> {
  if (!token?.includes(".")) return { ok: false };
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i);
  const sigB64 = token.slice(i + 1);
  if (!payload || !sigB64) return { ok: false };
  const sigDecoded = base64UrlToBytes(sigB64);
  if (!sigDecoded) return { ok: false };
  const expected = await hmacSha256Raw(secret, payload);
  if (!timingSafeEqualBytes(sigDecoded, expected)) return { ok: false };
  let exp: unknown;
  try {
    const payloadBytes = base64UrlToBytes(payload);
    if (!payloadBytes) return { ok: false };
    exp = JSON.parse(new TextDecoder().decode(payloadBytes)).exp;
  } catch {
    return { ok: false };
  }
  if (typeof exp !== "number" || exp < nowMs) return { ok: false };
  return { ok: true, refreshedToken: await createSmarttaskPasswordAuthSignedSessionToken(secret, nowMs) };
}
