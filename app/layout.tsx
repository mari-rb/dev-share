import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/app-shell'
import { DataInitializer } from '@/components/data-initializer'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: 'DevShare — Dicas para profissionais de tech',
  description: 'Plataforma de dicas para Devs, Designers, DevOps, Dados e Produtividade.',
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${_inter.variable} ${_jetbrains.variable} font-sans antialiased`}>
        <DataInitializer />
        <AppShell>
          {children}
        </AppShell>
        <Analytics />
      </body>
    </html>
  )
}
