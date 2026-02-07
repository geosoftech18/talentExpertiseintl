import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import PublicLayout from "@/components/public-layout"
import CopyProtection from "@/components/copy-protection"
import "./globals.css"

export const metadata: Metadata = {
  title: "TEI Training & Consultancy | Professional Development Courses",
  description: "Talent Expertise International - World-class training programs and professional development courses",
  generator: "v0.app",
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
          <PublicLayout>{children}</PublicLayout>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
