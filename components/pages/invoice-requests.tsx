"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, CheckCircle, XCircle, Eye, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface InvoiceRequest {
  id: string
  name: string
  email: string
  company?: string
  courseTitle?: string
  amount: number
  participants?: number
  status: string
  rejectionReason?: string
  approvedAt?: string
  submittedAt: string
  createdAt: string
  address: string
  city: string
  country: string
  telephone: string
  telephoneCountryCode: string
  mobile?: string
  scheduleId?: string
  courseId?: string
}

export default function InvoiceRequests() {
  const [requests, setRequests] = useState<InvoiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [selectedRequest, setSelectedRequest] = useState<InvoiceRequest | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [participants, setParticipants] = useState<number>(1)
  const [perParticipantAmount, setPerParticipantAmount] = useState<number>(0)

  // Fetch invoice requests
  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admin/invoice-requests?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data || [])
      } else {
        setError(result.error || "Failed to fetch invoice requests")
      }
    } catch (err) {
      console.error("Error fetching invoice requests:", err)
      setError("Failed to load invoice requests. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    if (participants < 1) {
      alert("Number of participants must be at least 1")
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/invoice-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "approve",
          participants: participants,
          amount: totalAmount,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Remove from list (it's now approved and moved to orders)
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
        setActionDialogOpen(false)
        setSelectedRequest(null)
        alert("Invoice request approved! Order created with 'In Progress' status.")
      } else {
        alert(result.error || "Failed to approve invoice request")
      }
    } catch (err) {
      console.error("Error approving invoice request:", err)
      alert("Failed to approve invoice request. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/invoice-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update status in list
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRequest.id
              ? { ...r, status: "REJECTED", rejectionReason: rejectionReason || undefined }
              : r
          )
        )
        setActionDialogOpen(false)
        setSelectedRequest(null)
        setRejectionReason("")
        alert("Invoice request rejected.")
      } else {
        alert(result.error || "Failed to reject invoice request")
      }
    } catch (err) {
      console.error("Error rejecting invoice request:", err)
      alert("Failed to reject invoice request. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const openActionDialog = (request: InvoiceRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setRejectionReason("")
    // Initialize participants and calculate per-participant amount
    const initialParticipants = request.participants || 1
    setParticipants(initialParticipants)
    // Calculate per-participant amount: if participants exist, divide; otherwise assume amount is for 1 participant
    const calculatedPerParticipant = request.participants 
      ? request.amount / request.participants 
      : request.amount
    setPerParticipantAmount(calculatedPerParticipant)
    setActionDialogOpen(true)
  }

  // Calculate total amount based on participants
  const totalAmount = participants * perParticipantAmount

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-400/20 dark:text-yellow-400"
      case "APPROVED":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "REJECTED":
        return "bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Filter requests by search query
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.name.toLowerCase().includes(query) ||
      request.email.toLowerCase().includes(query) ||
      request.company?.toLowerCase().includes(query) ||
      request.courseTitle?.toLowerCase().includes(query)
    )
  })

  // Count requests by status
  const requestCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Invoice Requests</h1>
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
          <h1 className="text-4xl font-bold theme-text mb-2">Invoice Requests</h1>
        </div>
        <div className="theme-card rounded-xl p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchRequests} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold theme-text mb-2">Invoice Requests</h1>
        <p className="theme-muted">Review and approve invoice payment requests</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`pb-3 px-1 font-medium transition-colors ${
            statusFilter === "ALL"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          All ({requestCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`pb-3 px-1 font-medium transition-colors ${
            statusFilter === "PENDING"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Pending ({requestCounts.pending})
        </button>
        <button
          onClick={() => setStatusFilter("APPROVED")}
          className={`pb-3 px-1 font-medium transition-colors ${
            statusFilter === "APPROVED"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Approved ({requestCounts.approved})
        </button>
        <button
          onClick={() => setStatusFilter("REJECTED")}
          className={`pb-3 px-1 font-medium transition-colors ${
            statusFilter === "REJECTED"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Rejected ({requestCounts.rejected})
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <Button
          onClick={fetchRequests}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <Input
            type="text"
            placeholder="Search by name, email, company, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Submitted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center theme-muted">
                    No invoice requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium theme-text">{request.name}</div>
                      <div className="text-sm theme-muted">{request.email}</div>
                      {request.company && (
                        <div className="text-xs theme-muted mt-1">{request.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="theme-text max-w-xs truncate">
                        {request.courseTitle || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold theme-text">
                        ${request.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm theme-text">
                      {format(new Date(request.submittedAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            // Show details in a dialog or navigate to detail view
                          }}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog(request, "approve")}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog(request, "reject")}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Invoice Request" : "Reject Invoice Request"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm theme-muted">Customer:</span> <strong className="theme-text">{selectedRequest.name}</strong>
                    </div>
                    <div>
                      <span className="text-sm theme-muted">Email:</span> <strong className="theme-text">{selectedRequest.email}</strong>
                    </div>
                    <div>
                      <span className="text-sm theme-muted">Company:</span> <strong className="theme-text">{selectedRequest.company || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-sm theme-muted">Course:</span> <strong className="theme-text">{selectedRequest.courseTitle || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-sm theme-muted">Location:</span> <strong className="theme-text">{selectedRequest.city}, {selectedRequest.country}</strong>
                    </div>
                    <div>
                      <span className="text-sm theme-muted">Original Amount:</span> <strong className="theme-text">${selectedRequest.amount.toFixed(2)}</strong>
                    </div>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionType === "reject" && (
              <div>
                <label className="text-sm font-medium theme-text mb-2 block">
                  Rejection Reason (Optional)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            )}
            {actionType === "approve" && selectedRequest && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm theme-text">
                    Approving this request will create an order with <strong>"In Progress"</strong> status
                    and remove it from the invoice requests list.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium theme-text block">
                      Number of Participants *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={participants}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        setParticipants(Math.max(1, value))
                      }}
                      className="w-full"
                      required
                    />
                    <p className="text-xs theme-muted">
                      Original: {selectedRequest.participants || 1} participant{(selectedRequest.participants || 1) > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium theme-text block">
                      Amount per Participant *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={perParticipantAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setPerParticipantAmount(Math.max(0, value))
                      }}
                      className="w-full"
                      required
                    />
                    <p className="text-xs theme-muted">
                      Original: ${(selectedRequest.amount / (selectedRequest.participants || 1)).toFixed(2)} per participant
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-muted">Amount per participant:</span>
                      <span className="text-sm font-semibold theme-text">${perParticipantAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-muted">Number of participants:</span>
                      <span className="text-sm font-semibold theme-text">{participants}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold theme-text">Total Amount:</span>
                        <span className="text-lg font-bold theme-text">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={actionType === "approve" ? handleApprove : handleReject}
              disabled={processing}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

