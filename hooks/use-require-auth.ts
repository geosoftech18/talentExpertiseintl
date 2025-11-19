"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

/**
 * Hook to require authentication before accessing a component
 * Redirects to /auth if user is not logged in
 */
export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return

    // If not authenticated, redirect to auth page
    if (status === "unauthenticated" || !session?.user) {
      router.push("/auth")
    }
  }, [session, status, router])

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!session?.user,
  }
}

