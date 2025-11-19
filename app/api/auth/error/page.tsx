"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration. Please check your environment variables.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication. Please try again.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from an OAuth provider.",
    OAuthCreateAccount: "Could not create OAuth account in the database.",
    EmailCreateAccount: "Could not create email account in the database.",
    Callback: "Error in the OAuth callback handler route.",
    OAuthAccountNotLinked: "An account with this email already exists. Please sign in with your original provider.",
    EmailSignin: "The email could not be sent.",
    CredentialsSignin: "Invalid email or password.",
    SessionRequired: "Please sign in to access this page.",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">Error Code: {error || "Unknown"}</p>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>

          {error === "Configuration" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Check these settings:</p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>NEXTAUTH_URL is set correctly</li>
                <li>NEXTAUTH_SECRET is set</li>
                <li>GOOGLE_CLIENT_ID is correct</li>
                <li>GOOGLE_CLIENT_SECRET is correct</li>
                <li>Redirect URI matches: http://localhost:3000/api/auth/callback/google</li>
              </ul>
            </div>
          )}

          {error === "OAuthCallback" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">Common causes:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Redirect URI mismatch in Google Cloud Console</li>
                <li>OAuth consent screen not configured</li>
                <li>App is in testing mode and your email is not added as a test user</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              asChild
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              <Link href="/contact">Need Help? Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading error details...</p>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}

