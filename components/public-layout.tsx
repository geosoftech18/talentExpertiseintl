'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ChatwootWidget from '@/components/chatwoot-widget'
import WhatsAppWidget from '@/components/whatsapp-widget'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <ChatwootWidget />
      </div>
    </SessionProvider>
  )
}

