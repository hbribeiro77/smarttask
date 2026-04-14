/**
 * Parseia lista de e-mails permitidos (env), sempre em minúsculas para comparação segura.
 */
export function parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString(
  raw: string | undefined
): Set<string> {
  if (!raw?.trim()) return new Set();
  const parts = raw.split(/[,;\n\r]+/);
  const out = new Set<string>();
  for (const p of parts) {
    const e = p.trim().toLowerCase();
    if (e) out.add(e);
  }
  return out;
}

export function isSmarttaskGoogleOAuthEnabledFromEnvironment(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()
  );
}
