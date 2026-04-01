import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import "../css/controls.css"

import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { VoteAuthDialogHost } from "@/components/vote-auth-dialog-host"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/config"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <VoteAuthDialogHost />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
