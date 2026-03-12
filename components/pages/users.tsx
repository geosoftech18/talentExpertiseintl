"use client"

import { useState, useEffect } from "react"
import { Search, User, Mail, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  _count: {
    courseRegistrations: number
    accounts: number
  }
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
      })
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users")
      }

      setUsers(result.data)
      setTotalPages(result.pagination?.totalPages || 1)
      setTotal(result.pagination?.total || 0)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const getDisplayName = (user: User) => {
    if (user.name) return user.name
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return "N/A"
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-8 space-y-8 theme-bg">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="p-8 space-y-8 theme-bg">
        <div className="theme-card rounded-xl p-6">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 theme-bg">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold theme-text mb-2">Users</h1>
        <p className="theme-muted">View all registered users (read-only)</p>
      </div>

      {/* Search and Stats */}
      <div className="theme-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 theme-primary" />
            <span className="theme-text font-medium">
              Total Users: <span className="theme-primary">{total}</span>
            </span>
          </div>
         
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 theme-muted mx-auto mb-4" />
            <p className="theme-muted">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">Email Verified</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">Registrations</th>
                    
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative overflow-hidden shrink-0">
                            {user.image && user.image !== "null" && user.image !== "undefined" ? (
                              <img
                                src={user.image}
                                alt={getDisplayName(user)}
                                className="w-full h-full object-cover absolute inset-0"
                                onError={(e) => {
                                  // Hide image on error, icon will show as fallback
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : null}
                            <User className="w-5 h-5 theme-primary relative z-10" />
                          </div>
                          <div>
                            <p className="font-medium theme-text">{getDisplayName(user)}</p>
                            {user.firstName || user.lastName ? (
                              <p className="text-xs theme-muted">{user.email}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 theme-muted" />
                          <span className="theme-text text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {user.emailVerified ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm theme-text">
                              {format(new Date(user.emailVerified), "MMM dd, yyyy")}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm theme-muted">Not verified</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="theme-text text-sm">{user._count.courseRegistrations}</span>
                      </td>
                     
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 theme-muted" />
                          <span className="theme-text text-sm">
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-sm theme-muted">
                  Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, total)} of {total} users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 theme-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 theme-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

