"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, Clock, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

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
  updatedAt: string
}

export default function EnquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [enquiry, setEnquiry] = useState<CourseEnquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState<CourseEnquiry | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/enquiries/${id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch enquiry')
        }

        setEnquiry(result.data)
      } catch (err) {
        console.error('Error fetching enquiry:', err)
        setError(err instanceof Error ? err.message : 'Failed to load enquiry')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEnquiry()
    }
  }, [id])

  const handleStatusUpdate = async (newStatus: 'Approved' | 'Cancelled') => {
    if (!enquiry) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/enquiries/${id}`, {
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

      setEnquiry(result.data)
      if (isEditing && editingData) {
        setEditingData({ ...editingData, status: newStatus })
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleEdit = () => {
    if (enquiry) {
      setEditingData({ ...enquiry })
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingData(null)
  }

  const handleSave = async () => {
    if (!editingData) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editingData.firstName,
          lastName: editingData.lastName,
          email: editingData.email,
          phone: editingData.phone,
          countryCode: editingData.countryCode,
          company: editingData.company,
          jobTitle: editingData.jobTitle || null,
          courseTitle: editingData.courseTitle || null,
          schedulePreference: editingData.schedulePreference || null,
          participants: editingData.participants || null,
          message: editingData.message || null,
          status: editingData.status,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update enquiry')
      }

      setEnquiry(result.data)
      setIsEditing(false)
      setEditingData(null)
    } catch (err) {
      console.error('Error updating enquiry:', err)
      alert(err instanceof Error ? err.message : 'Failed to update enquiry')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 theme-bg">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !enquiry) {
    return (
      <div className="p-8 theme-bg">
        <div className="theme-card rounded-xl p-6">
          <p className="text-destructive mb-4">Error: {error || 'Enquiry not found'}</p>
          <Button onClick={() => router.push('/admin?page=enquiries')} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Enquiries
          </Button>
        </div>
      </div>
    )
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
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        <Icon size={16} />
        {status}
      </span>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/admin?page=enquiries')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold theme-text mb-2">Course Enquiry Details</h1>
            <p className="theme-muted">View and manage enquiry information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && getStatusBadge(enquiry.status)}
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={saving}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={handleEdit}
                variant="outline"
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
              {enquiry.status === 'Pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate('Approved')}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('Cancelled')}
                    disabled={updating}
                    variant="destructive"
                  >
                    <XCircle size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enquiry Details */}
      <div className="theme-card rounded-xl p-6 space-y-6">
        {/* Status and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-border">
          {isEditing && editingData ? (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={editingData.status}
                onValueChange={(value) => setEditingData({ ...editingData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <p className="text-sm theme-muted mb-1">Status</p>
              {getStatusBadge(enquiry.status)}
            </div>
          )}
          <div>
            <p className="text-sm theme-muted mb-1">Submitted Date</p>
            <p className="theme-text">
              {enquiry.submittedAt ? format(new Date(enquiry.submittedAt), 'PPP') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm theme-muted mb-1">Last Updated</p>
            <p className="theme-text">
              {enquiry.updatedAt ? format(new Date(enquiry.updatedAt), 'PPP') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="font-semibold theme-text mb-4 pb-2 border-b border-border text-lg">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing && editingData ? (
              <>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editingData.firstName}
                    onChange={(e) => setEditingData({ ...editingData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editingData.lastName}
                    onChange={(e) => setEditingData({ ...editingData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingData.email}
                    onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex gap-2">
                    <Input
                      id="countryCode"
                      value={editingData.countryCode}
                      onChange={(e) => setEditingData({ ...editingData, countryCode: e.target.value })}
                      className="w-20"
                      placeholder="+971"
                    />
                    <Input
                      id="phone"
                      value={editingData.phone}
                      onChange={(e) => setEditingData({ ...editingData, phone: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                  <Input
                    id="jobTitle"
                    value={editingData.jobTitle || ''}
                    onChange={(e) => setEditingData({ ...editingData, jobTitle: e.target.value || null })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm theme-muted mb-1">Full Name</p>
                  <p className="theme-text font-medium">
                    {enquiry.firstName} {enquiry.lastName}
                  </p>
                </div>
                {enquiry.jobTitle && (
                  <div>
                    <p className="text-sm theme-muted mb-1">Job Title</p>
                    <p className="theme-text">{enquiry.jobTitle}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm theme-muted mb-1">Email</p>
                  <p className="theme-text">{enquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm theme-muted mb-1">Phone</p>
                  <p className="theme-text">
                    {enquiry.countryCode} {enquiry.phone}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="font-semibold theme-text mb-4 pb-2 border-b border-border text-lg">
            Company Information
          </h3>
          {isEditing && editingData ? (
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={editingData.company}
                onChange={(e) => setEditingData({ ...editingData, company: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm theme-muted mb-1">Company</p>
              <p className="theme-text">{enquiry.company}</p>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div>
          <h3 className="font-semibold theme-text mb-4 pb-2 border-b border-border text-lg">
            Course Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing && editingData ? (
              <>
                <div>
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    value={editingData.courseTitle || ''}
                    onChange={(e) => setEditingData({ ...editingData, courseTitle: e.target.value || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="participants">Participants</Label>
                  <Input
                    id="participants"
                    value={editingData.participants || '1'}
                    onChange={(e) => setEditingData({ ...editingData, participants: e.target.value || null })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="schedulePreference">Schedule Preference (Optional)</Label>
                  <Input
                    id="schedulePreference"
                    value={editingData.schedulePreference || ''}
                    onChange={(e) => setEditingData({ ...editingData, schedulePreference: e.target.value || null })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm theme-muted mb-1">Course</p>
                  <p className="theme-text">{enquiry.courseTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm theme-muted mb-1">Participants</p>
                  <p className="theme-text">{enquiry.participants || '1'}</p>
                </div>
                {enquiry.schedulePreference && (
                  <div>
                    <p className="text-sm theme-muted mb-1">Schedule Preference</p>
                    <p className="theme-text">{enquiry.schedulePreference}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <h3 className="font-semibold theme-text mb-4 pb-2 border-b border-border text-lg">
            Message
          </h3>
          {isEditing && editingData ? (
            <Textarea
              id="message"
              value={editingData.message || ''}
              onChange={(e) => setEditingData({ ...editingData, message: e.target.value || null })}
              rows={4}
            />
          ) : (
            <p className="theme-text whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {enquiry.message || 'No message'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

