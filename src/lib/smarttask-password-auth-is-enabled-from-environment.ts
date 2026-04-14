/** Senha definida e não vazia → login obrigatório. */
export function isSmarttaskPasswordAuthEnabledFromEnvironment(): boolean {
  return Boolean(process.env.SMARTTASK_ACCESS_PASSWORD?.trim());
}
