"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Eye, X, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"

interface InHouseCourseRequest {
  id: string
  title?: string | null
  name: string
  email: string
  designation?: string | null
  company: string
  address: string
  city: string
  country: string
  telephone: string
  telephoneCountryCode: string
  mobile?: string | null
  mobileCountryCode?: string | null
  courseId?: string | null
  courseTitle?: string | null
  preferredDates?: string | null
  participants: string
  location?: string | null
  message?: string | null
  submittedAt: string
  createdAt: string
}

export default function InHouseRequests() {
  const [requests, setRequests] = useState<InHouseCourseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [previewRequest, setPreviewRequest] = useState<InHouseCourseRequest | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/forms/in-house-course?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch requests')
        }

        if (result.success) {
          setRequests(result.data)
        }
      } catch (err) {
        console.error('Error fetching in-house requests:', err)
        setError(err instanceof Error ? err.message : 'Failed to load requests')
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) {
      return requests
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return requests.filter((request) => {
      const fullName = request.name?.toLowerCase() || ''
      const email = request.email?.toLowerCase() || ''
      const company = request.company?.toLowerCase() || ''
      const courseTitle = request.courseTitle?.toLowerCase() || ''
      const city = request.city?.toLowerCase() || ''
      const country = request.country?.toLowerCase() || ''
      
      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        company.includes(searchLower) ||
        courseTitle.includes(searchLower) ||
        city.includes(searchLower) ||
        country.includes(searchLower)
      )
    })
  }, [requests, searchTerm])

  const handlePreview = (request: InHouseCourseRequest) => {
    setPreviewRequest(request)
    setShowPreview(true)
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div>
        <h1 className="text-4xl font-bold theme-text mb-2">In-House Course Requests</h1>
        <p className="theme-muted">View and manage all in-house course training requests</p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, company, course, city, or country..."
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
          <p className="theme-muted">Loading requests...</p>
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

      {/* Requests Table */}
      {!loading && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              {requests.length === 0 ? (
                <p className="theme-muted mb-4">No in-house course requests found.</p>
              ) : (
                <p className="theme-muted mb-4">No requests found matching "{searchTerm}". Try a different search term.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Participants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Submitted Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 theme-text font-medium">
                      {request.title && `${request.title} `}
                      {request.name}
                      {request.designation && (
                        <span className="block text-xs theme-muted mt-1">{request.designation}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 theme-muted">{request.email}</td>
                    <td className="px-6 py-4 theme-muted">{request.company}</td>
                    <td className="px-6 py-4 theme-text">
                      {request.courseTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 theme-muted">{request.participants}</td>
                    <td className="px-6 py-4 theme-muted">
                      {request.location || `${request.city}, ${request.country}`}
                    </td>
                    <td className="px-6 py-4 theme-muted">
                      {request.submittedAt ? format(new Date(request.submittedAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePreview(request)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              In-House Course Request Details
            </DialogTitle>
            <DialogDescription>
              Submitted on {previewRequest?.submittedAt ? format(new Date(previewRequest.submittedAt), 'PPP') : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          {previewRequest && (
            <div className="space-y-6 mt-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm theme-muted mb-1">Full Name</p>
                    <p className="theme-text font-medium">
                      {previewRequest.title && `${previewRequest.title} `}
                      {previewRequest.name}
                    </p>
                  </div>
                  {previewRequest.designation && (
                    <div>
                      <p className="text-sm theme-muted mb-1">Designation</p>
                      <p className="theme-text">{previewRequest.designation}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm theme-muted mb-1">Email</p>
                    <p className="theme-text">{previewRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Telephone</p>
                    <p className="theme-text">{previewRequest.telephoneCountryCode} {previewRequest.telephone}</p>
                  </div>
                  {previewRequest.mobile && (
                    <div>
                      <p className="text-sm theme-muted mb-1">Mobile</p>
                      <p className="theme-text">{previewRequest.mobileCountryCode} {previewRequest.mobile}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm theme-muted mb-1">Company</p>
                    <p className="theme-text">{previewRequest.company}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Address</p>
                    <p className="theme-text">{previewRequest.address}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">City</p>
                    <p className="theme-text">{previewRequest.city}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Country</p>
                    <p className="theme-text">{previewRequest.country}</p>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div>
                <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Course Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm theme-muted mb-1">Course</p>
                    <p className="theme-text">{previewRequest.courseTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Participants</p>
                    <p className="theme-text">{previewRequest.participants}</p>
                  </div>
                  {previewRequest.preferredDates && (
                    <div>
                      <p className="text-sm theme-muted mb-1">Preferred Dates</p>
                      <p className="theme-text">{previewRequest.preferredDates}</p>
                    </div>
                  )}
                  {previewRequest.location && (
                    <div>
                      <p className="text-sm theme-muted mb-1">Preferred Location</p>
                      <p className="theme-text">{previewRequest.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {previewRequest.message && (
                <div>
                  <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Additional Message</h3>
                  <p className="theme-text whitespace-pre-wrap">{previewRequest.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

