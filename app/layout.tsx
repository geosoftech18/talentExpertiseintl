import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import PublicLayout from "@/components/public-layout"
import CopyProtection from "@/components/copy-protection"
import RouteMetadata from "@/components/route-metadata"
import { getMetaForPath } from "@/lib/route-meta"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const pathname = h.get("x-pathname") || "/"
  const meta = getMetaForPath(pathname)

  return {
    title: meta.title,
    description: meta.description,
    generator: "v0.app",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CopyProtection />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <RouteMetadata />
          <PublicLayout>{children}</PublicLayout>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
