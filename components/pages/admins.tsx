"use client"

import { useState, useEffect } from "react"
import { Shield, Mail, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminEmail {
  email: string
}

export default function Admins() {
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminEmails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/admins')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch admin emails')
        }

        if (result.success) {
          setAdminEmails(result.data || [])
        } else {
          throw new Error(result.error || 'Failed to fetch admin emails')
        }
      } catch (err) {
        console.error('Error fetching admin emails:', err)
        setError(err instanceof Error ? err.message : 'Failed to load admin emails')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminEmails()
  }, [])

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Admin Emails</h1>
          <p className="theme-muted">View all authorized admin email addresses (read-only)</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin theme-primary" />
            <span className="ml-3 theme-text">Loading admin emails...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authorized Admin Emails
            </CardTitle>
            <CardDescription>
              These email addresses have admin access to the system. This list is read-only and managed in the system configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adminEmails.length === 0 ? (
              <div className="text-center py-8">
                <p className="theme-muted">No admin emails found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminEmails.map((admin, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 theme-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium theme-text">{admin.email}</p>
                      <p className="text-xs theme-muted mt-1">Admin Access</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-xs font-medium theme-primary">Admin</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

