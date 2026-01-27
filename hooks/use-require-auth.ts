"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

/**
 * Hook to require authentication before accessing a component
 * Redirects to /auth if user is not logged in
 * Stores current path as callback URL for redirect after login
 */
export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return

    // If not authenticated, redirect to auth page with callback URL
    if (status === "unauthenticated" || !session?.user) {
      // Store current path in sessionStorage for redirect after login
      if (typeof window !== 'undefined' && pathname) {
        sessionStorage.setItem('callbackUrl', pathname)
      }
      // Pass callback URL as query parameter
      const callbackUrl = pathname ? encodeURIComponent(pathname) : ''
      router.push(`/auth${callbackUrl ? `?callbackUrl=${callbackUrl}` : ''}`)
    }
  }, [session, status, router, pathname])

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!session?.user,
  }
}

