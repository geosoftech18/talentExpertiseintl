"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Loader2 } from "lucide-react"

interface Registration {
  id: string
  delegateName: string
  company: string | null
  program: string | null
  registrationDate: string
  scheduleDate: string | null
  leadStatus: "New" | "Contacted" | "Confirmed" | "Paid"
  email?: string
  paymentMethod?: string
}

export default function CourseRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Fetch registrations from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/forms/course-registration?limit=1000")
        const result = await response.json()

        if (result.success) {
          // Transform database data to display format
          const transformedRegistrations: Registration[] = (result.data || []).map((reg: any) => {
            // Determine lead status based on payment method
            let leadStatus: "New" | "Contacted" | "Confirmed" | "Paid" = "New"
            if (reg.paymentMethod === "credit" || reg.paymentMethod === "purchase") {
              leadStatus = "Paid"
            } else if (reg.paymentMethod === "bank") {
              leadStatus = "Confirmed"
            } else if (reg.paymentMethod === "invoice") {
              leadStatus = "Contacted"
            }

            // Format registration date
            const date = new Date(reg.submittedAt || reg.createdAt)
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })

            // Format schedule date
            let scheduleDate: string | null = null
            if (reg.schedule?.startDate) {
              const scheduleStartDate = new Date(reg.schedule.startDate)
              const scheduleEndDate = reg.schedule.endDate ? new Date(reg.schedule.endDate) : null
              
              if (scheduleEndDate && scheduleStartDate.getTime() !== scheduleEndDate.getTime()) {
                // Date range
                scheduleDate = `${scheduleStartDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} - ${scheduleEndDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              } else {
                // Single date
                scheduleDate = scheduleStartDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            }

            return {
              id: reg.id,
              delegateName: reg.name,
              company: reg.company || null,
              program: reg.courseTitle || null,
              registrationDate: formattedDate,
              scheduleDate,
              leadStatus,
              email: reg.email,
              paymentMethod: reg.paymentMethod,
            }
          })

          setRegistrations(transformedRegistrations)
          setFilteredRegistrations(transformedRegistrations)
        } else {
          setError(result.error || "Failed to fetch registrations")
        }
      } catch (err) {
        console.error("Error fetching registrations:", err)
        setError("Failed to load registrations. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  // Filter registrations based on search and status
  useEffect(() => {
    let filtered = registrations

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (reg) =>
          reg.delegateName.toLowerCase().includes(query) ||
          reg.company?.toLowerCase().includes(query) ||
          reg.program?.toLowerCase().includes(query) ||
          reg.email?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter && statusFilter !== "All Status") {
      filtered = filtered.filter((reg) => reg.leadStatus === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }, [searchQuery, statusFilter, registrations])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "New":
        return "bg-primary/20 text-primary"
      case "Contacted":
        return "bg-accent/20 text-accent"
      case "Paid":
        return "bg-purple-500/20 text-purple-500 dark:bg-purple-400/20 dark:text-purple-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Course Registrations</h1>
          <p className="theme-muted">Manage student enrollments and lead status</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin theme-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Course Registrations</h1>
          <p className="theme-muted">Manage student enrollments and lead status</p>
        </div>
        <div className="theme-card rounded-xl p-6 text-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div>
        <h1 className="text-4xl font-bold theme-text mb-2">Course Registrations</h1>
        <p className="theme-muted">Manage student enrollments and lead status</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Registrations Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Delegate Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Company</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Schedule Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Registration Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Lead Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center theme-muted">
                  {registrations.length === 0
                    ? "No registrations found"
                    : "No registrations match your search criteria"}
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 theme-text font-medium">{reg.delegateName}</td>
                  <td className="px-6 py-4 theme-muted">{reg.company || "—"}</td>
                  <td className="px-6 py-4 theme-text">{reg.program || "—"}</td>
                  <td className="px-6 py-4 theme-muted">{reg.scheduleDate || "—"}</td>
                  <td className="px-6 py-4 theme-muted">{reg.registrationDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reg.leadStatus)}`}>
                      {reg.leadStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
