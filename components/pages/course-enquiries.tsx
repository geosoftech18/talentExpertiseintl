"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, X, Download, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import * as XLSX from "xlsx"

interface CourseEnquiry {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  company: string
  jobTitle?: string | null
  courseId?: string | null
  courseTitle?: string | null
  schedulePreference?: string | null
  participants?: string | null
  message?: string | null
  status: string
  submittedAt: string
  createdAt: string
}

export default function CourseEnquiries() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<CourseEnquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEnquiries, setSelectedEnquiries] = useState<Set<string>>(new Set())
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/forms/course-enquiry?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch enquiries')
        }

        if (result.success) {
          setEnquiries(result.data)
        }
      } catch (err) {
        console.error('Error fetching enquiries:', err)
        setError(err instanceof Error ? err.message : 'Failed to load enquiries')
        setEnquiries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEnquiries()
  }, [])

  // Filter enquiries based on search term
  const filteredEnquiries = useMemo(() => {
    if (!searchTerm.trim()) {
      return enquiries
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return enquiries.filter((enquiry) => {
      const fullName = `${enquiry.firstName} ${enquiry.lastName}`.toLowerCase()
      const email = enquiry.email?.toLowerCase() || ''
      const company = enquiry.company?.toLowerCase() || ''
      const courseTitle = enquiry.courseTitle?.toLowerCase() || ''
      const phone = enquiry.phone?.toLowerCase() || ''
      const status = (enquiry.status || 'Pending').toLowerCase()
      
      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        company.includes(searchLower) ||
        courseTitle.includes(searchLower) ||
        phone.includes(searchLower) ||
        status.includes(searchLower)
      )
    })
  }, [enquiries, searchTerm])

  const handleViewEnquiry = (enquiryId: string) => {
    router.push(`/admin/enquiries/${enquiryId}`)
  }

  const handleStatusUpdate = async (enquiryId: string, newStatus: 'Approved' | 'Cancelled') => {
    try {
      setUpdatingStatus(enquiryId)
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      // Update the enquiry in the list
      setEnquiries(prev => prev.map(e => e.id === enquiryId ? result.data : e))
    } catch (err) {
      console.error('Error updating status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: {
        icon: Clock,
        className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      },
      Approved: {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-600 dark:text-green-400",
      },
      Cancelled: {
        icon: XCircle,
        className: "bg-red-500/20 text-red-600 dark:text-red-400",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        <Icon size={12} />
        {status}
      </span>
    )
  }

  // Selection handlers
  const handleSelectEnquiry = (enquiryId: string, checked: boolean) => {
    setSelectedEnquiries(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(enquiryId)
      } else {
        newSet.delete(enquiryId)
      }
      return newSet
    })
  }

  const handleSelectAllEnquiries = (checked: boolean) => {
    if (checked) {
      setSelectedEnquiries(new Set(filteredEnquiries.map(e => e.id)))
    } else {
      setSelectedEnquiries(new Set())
    }
  }

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data selected to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data selected to export')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const handleExportEnquiries = (exportFormat: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedEnquiries)
    const dataToExport = selectedIds.length > 0
      ? filteredEnquiries.filter(e => selectedIds.includes(e.id))
      : filteredEnquiries

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(enquiry => ({
      'First Name': enquiry.firstName,
      'Last Name': enquiry.lastName,
      'Email': enquiry.email,
      'Phone': `${enquiry.countryCode} ${enquiry.phone}`,
      'Company': enquiry.company,
      'Job Title': enquiry.jobTitle || 'N/A',
      'Course': enquiry.courseTitle || 'N/A',
      'Participants': enquiry.participants || '1',
      'Schedule Preference': enquiry.schedulePreference || 'N/A',
      'Status': enquiry.status || 'Pending',
      'Message': enquiry.message || 'N/A',
      'Submitted Date': enquiry.submittedAt ? format(new Date(enquiry.submittedAt), 'yyyy-MM-dd') : 'N/A',
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `course_enquiries_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
    if (exportFormat === 'csv') {
      exportToCSV(exportData, filename)
    } else {
      exportToExcel(exportData, filename)
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Course Enquiries</h1>
          <p className="theme-muted">View and manage all course enquiry submissions</p>
        </div>
        {filteredEnquiries.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedEnquiries.size > 0 && (
              <span className="text-sm theme-muted">
                {selectedEnquiries.size} selected
              </span>
            )}
            <Button
              onClick={() => handleExportEnquiries('csv')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV {selectedEnquiries.size > 0 && `(${selectedEnquiries.size})`}
            </Button>
            <Button
              onClick={() => handleExportEnquiries('excel')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export Excel {selectedEnquiries.size > 0 && `(${selectedEnquiries.size})`}
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, company, course, or phone..."
            className="w-full pl-10 pr-10 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-muted hover:theme-text transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading enquiries...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="text-destructive">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Enquiries Table */}
      {!loading && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center">
              {enquiries.length === 0 ? (
                <p className="theme-muted mb-4">No enquiries found.</p>
              ) : (
                <p className="theme-muted mb-4">No enquiries found matching "{searchTerm}". Try a different search term.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredEnquiries.length > 0 && filteredEnquiries.every(e => selectedEnquiries.has(e.id))}
                      onCheckedChange={(checked) => handleSelectAllEnquiries(checked === true)}
                      title="Select all"
                      className="border border-gray-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Participants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Submitted Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedEnquiries.has(enquiry.id)}
                        onCheckedChange={(checked) => handleSelectEnquiry(enquiry.id, checked === true)}
                        className="border border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status || 'Pending')}
                    </td>
                    <td className="px-6 py-4 theme-text font-medium">
                      {enquiry.firstName} {enquiry.lastName}
                      {enquiry.jobTitle && (
                        <span className="block text-xs theme-muted mt-1">{enquiry.jobTitle}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 theme-muted">{enquiry.email}</td>
                    <td className="px-6 py-4 theme-muted">{enquiry.company}</td>
                    <td className="px-6 py-4 theme-text">
                      {enquiry.courseTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 theme-muted">{enquiry.participants || '1'}</td>
                    <td className="px-6 py-4 theme-muted">
                      {enquiry.submittedAt ? format(new Date(enquiry.submittedAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewEnquiry(enquiry.id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {enquiry.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(enquiry.id, 'Approved')}
                              disabled={updatingStatus === enquiry.id}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-green-600 dark:text-green-400 disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(enquiry.id, 'Cancelled')}
                              disabled={updatingStatus === enquiry.id}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-50"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

