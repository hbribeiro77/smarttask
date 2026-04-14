import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SmarttaskNextAuthSessionProviderClientWrapper } from "@/components/smarttask-next-auth-session-provider-client-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartTask",
  description:
    "Lista de tarefas com NLP, Foco do Dia, matriz Eisenhower e Cemitério.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body
        className={`${geistSans.className} flex min-h-full flex-col antialiased`}
      >
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Ir para o conteúdo
        </a>
        <SmarttaskNextAuthSessionProviderClientWrapper>
          <div id="conteudo-principal" className="flex flex-1 flex-col">
            {children}
          </div>
        </SmarttaskNextAuthSessionProviderClientWrapper>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
