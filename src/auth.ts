import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import {
  isSmarttaskGoogleOAuthEnabledFromEnvironment,
  parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString,
} from "@/lib/smarttask-parse-auth-allowed-emails-from-environment-comma-separated-string";

function resolveAuthSecret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (!isSmarttaskGoogleOAuthEnabledFromEnvironment()) {
    return "smarttask-oauth-off-placeholder-secret-min-32-chars-ok";
  }
  throw new Error(
    "[SmartTask auth] Defina AUTH_SECRET (ou NEXTAUTH_SECRET) quando AUTH_GOOGLE_ID/SECRET estiverem configurados."
  );
}

const authConfig = {
  trustHost: true,
  secret: resolveAuthSecret(),
  providers: isSmarttaskGoogleOAuthEnabledFromEnvironment()
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
    error: "/acesso-negado",
  },
  callbacks: {
    async signIn({ user }) {
      if (!isSmarttaskGoogleOAuthEnabledFromEnvironment()) return true;
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;
      const allowed =
        parseSmarttaskAuthAllowedEmailsFromEnvironmentCommaSeparatedString(
          process.env.AUTH_ALLOWED_EMAILS
        );
      if (allowed.size === 0) return false;
      return allowed.has(email);
    },
    authorized({ auth, request }) {
      if (!isSmarttaskGoogleOAuthEnabledFromEnvironment()) return true;
      const path = request.nextUrl.pathname;
      if (path.startsWith("/login")) return true;
      if (path.startsWith("/acesso-negado")) return true;
      if (path.startsWith("/api/auth")) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
