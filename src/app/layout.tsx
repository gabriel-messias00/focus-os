import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: { default: "FOCUS//OS — Personal Execution System", template: "%s · FOCUS//OS" },
  description: "Organize suas missões, sincronize seus dados e proteja seu tempo de foco.",
  applicationName: "FOCUS//OS",
  openGraph: {
    title: "FOCUS//OS — Menos abas. Mais execução.",
    description: "Um espaço para organizar tarefas, planejar seu dia e acompanhar seu foco.",
    type: "website",
    locale: "pt_BR"
  },
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c16",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
