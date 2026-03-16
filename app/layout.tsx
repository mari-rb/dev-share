import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/app-shell";
import { DataInitializer } from "@/components/data-initializer";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devshare.vercel.app"), // Substitua pela URL real
  title: "DevShare — Dicas para profissionais de tech",
  description:
    "Plataforma de dicas para Devs, Designers, DevOps, Dados e Produtividade.",
  keywords: [
    "dicas",
    "dev",
    "tecnologia",
    "programação",
    "design",
    "devops",
    "dados",
    "produtividade",
  ],
  authors: [{ name: "DevShare Team" }],
  creator: "DevShare",
  publisher: "DevShare",
  openGraph: {
    title: "DevShare — Dicas para profissionais de tech",
    description:
      "Plataforma de dicas para Devs, Designers, DevOps, Dados e Produtividade.",
    url: "/",
    siteName: "DevShare",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "DevShare - Plataforma de dicas técnicas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevShare — Dicas para profissionais de tech",
    description:
      "Plataforma de dicas para Devs, Designers, DevOps, Dados e Produtividade.",
    images: ["/placeholder-logo.png"],
    creator: "@devshare",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${_inter.variable} ${_jetbrains.variable} font-sans antialiased`}
      >
        <DataInitializer />
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
