/**
 * Segredo para assinar o cookie de sessão (HMAC-SHA256).
 * Prefira SMARTTASK_SESSION_SECRET na VPS; se ausente, usa SMARTTASK_ACCESS_PASSWORD.
 */
export function resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment(): string {
  const session = process.env.SMARTTASK_SESSION_SECRET?.trim();
  if (session) return session;
  const access = process.env.SMARTTASK_ACCESS_PASSWORD?.trim();
  if (access) return access;
  return "smarttask-auth-disabled-placeholder-min-32-chars-xx";
}
