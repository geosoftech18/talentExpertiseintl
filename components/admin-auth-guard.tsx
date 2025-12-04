"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    // Allow access to login page
    if (pathname === '/admin/login') {
      setIsChecking(false)
      setIsAuthenticated(false)
      return
    }

    try {
      const response = await fetch('/api/admin/auth/check')
      const data = await response.json()

      if (data.authenticated) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading state while checking
  if (isChecking && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen items-center justify-center theme-bg">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If on login page, don't check auth
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // If authenticated, show content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Otherwise, show nothing (redirecting)
  return null
}

