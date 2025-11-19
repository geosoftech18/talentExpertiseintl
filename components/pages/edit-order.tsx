"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Edit2, Trash2, X, CheckCircle, XCircle, Mail, Eye, Download, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface Order {
  id: number | string
  registrationId: string
  name: string
  email: string
  company?: string
  title?: string
  designation?: string
  courseTitle?: string
  date: string
  rawDate: Date
  scheduleDate?: string | null
  method: string
  paymentMethod?: string
  paymentStatus: "Paid" | "Unpaid" | "Partially Refunded" | "Refunded"
  status: "Completed" | "Incomplete" | "Cancelled"
  total: number
  address: string
  city: string
  country: string
  telephone: string
  telephoneCountryCode: string
  mobile?: string
  mobileCountryCode?: string
  differentBilling: boolean
  schedule?: {
    id: string
    startDate: Date
    endDate?: Date | null
    venue: string
    fee?: number | null
    status: string
    program?: {
      id: string
      programName: string
      refCode: string
    } | null
  } | null
}

interface OrderNote {
  id: string
  note: string
  isPrivate: boolean
  createdAt: Date
}

interface Invoice {
  id: string
  invoiceNo: string
  amount: number
  status: string
  paymentDate: string | null
  transactionId: string | null
  issueDate: string
  dueDate: string
  pdfUrl: string | null
  customerName: string
  customerEmail: string
}

export default function EditOrder() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [isPrivateNote, setIsPrivateNote] = useState(false)
  const [orderAction, setOrderAction] = useState("")
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [updateInvoiceDialogOpen, setUpdateInvoiceDialogOpen] = useState(false)
  const [invoiceAction, setInvoiceAction] = useState<"PAID" | "CANCELLED" | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [resendingEmail, setResendingEmail] = useState(false)

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/admin/orders/${orderId}`)
        const result = await response.json()

        if (result.success) {
          setOrder(result.data)
        } else {
          setError(result.error || "Failed to fetch order")
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  // Fetch order notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/notes`)
        const result = await response.json()

        if (result.success) {
          setNotes(result.data || [])
        }
      } catch (err) {
        console.error("Error fetching notes:", err)
      }
    }

    if (orderId) {
      fetchNotes()
    }
  }, [orderId])

  // Fetch invoice for all orders
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!order) {
        setInvoice(null)
        return
      }

      try {
        setInvoiceLoading(true)
        const response = await fetch(`/api/admin/invoices/by-registration/${order.registrationId}`)
        const result = await response.json()

        if (result.success && result.data) {
          setInvoice(result.data)
        } else {
          setInvoice(null)
        }
      } catch (err) {
        console.error("Error fetching invoice:", err)
        setInvoice(null)
      } finally {
        setInvoiceLoading(false)
      }
    }

    if (order) {
      fetchInvoice()
    }
  }, [order])

  const handleUpdateOrder = async () => {
    if (!order) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editValues),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh order data
        const refreshResponse = await fetch(`/api/admin/orders/${orderId}`)
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setOrder(refreshResult.data)
        }
        setEditingField(null)
        setEditValues({})
      } else {
        alert(result.error || "Failed to update order")
      }
    } catch (err) {
      console.error("Error updating order:", err)
      alert("Failed to update order. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleOrderAction = async () => {
    if (!orderAction) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: orderAction }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh order data and invoice
        const [orderResponse, invoiceResponse] = await Promise.all([
          fetch(`/api/admin/orders/${orderId}`),
          fetch(`/api/admin/invoices/by-registration/${order?.registrationId}`),
        ])
        
        const orderResult = await orderResponse.json()
        if (orderResult.success) {
          setOrder(orderResult.data)
        }

        const invoiceResult = await invoiceResponse.json()
        if (invoiceResult.success && invoiceResult.data) {
          setInvoice(invoiceResult.data)
        }

        setOrderAction("")
        // Show success message based on action
        if (orderAction === 'notify_customer') {
          alert('✅ Notification email sent successfully to the customer!')
        } else {
          alert(result.message || "Action executed successfully")
        }
      } else {
        throw new Error(result.error || "Failed to execute action")
      }
    } catch (err) {
      console.error("Error executing action:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to execute action. Please try again."
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: newNote,
          isPrivate: isPrivateNote,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setNotes([...notes, result.data])
        setNewNote("")
        setIsPrivateNote(false)
      } else {
        alert(result.error || "Failed to add note")
      }
    } catch (err) {
      console.error("Error adding note:", err)
      alert("Failed to add note. Please try again.")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    // In a full implementation, you'd call DELETE endpoint
    // For now, just remove from local state
    setNotes(notes.filter((n) => n.id !== noteId))
  }

  const handleMoveToTrash = async () => {
    if (!confirm("Are you sure you want to move this order to trash?")) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        router.push("/admin/orders")
      } else {
        alert(result.error || "Failed to move order to trash")
      }
    } catch (err) {
      console.error("Error moving to trash:", err)
      alert("Failed to move order to trash. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Invoice management handlers
  const handleUpdateInvoiceStatus = async () => {
    if (!invoice || !invoiceAction) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: invoiceAction,
          transactionId: transactionId || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh invoice and order data
        const invoiceResponse = await fetch(`/api/admin/invoices/by-registration/${order?.registrationId}`)
        const invoiceResult = await invoiceResponse.json()
        if (invoiceResult.success && invoiceResult.data) {
          setInvoice(invoiceResult.data)
        }

        const orderResponse = await fetch(`/api/admin/orders/${orderId}`)
        const orderResult = await orderResponse.json()
        if (orderResult.success) {
          setOrder(orderResult.data)
        }

        setUpdateInvoiceDialogOpen(false)
        setInvoiceAction(null)
        setTransactionId("")
        alert("Invoice status updated successfully")
      } else {
        alert(result.error || "Failed to update invoice")
      }
    } catch (err) {
      console.error("Error updating invoice:", err)
      alert("Failed to update invoice. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvoiceEmail = async () => {
    if (!invoice) return

    try {
      setResendingEmail(true)
      const response = await fetch(`/api/admin/invoices/resend/${invoice.id}`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert(`Invoice email sent successfully to ${invoice.customerEmail}`)
      } else {
        alert(result.error || "Failed to resend email")
      }
    } catch (err) {
      console.error("Error resending email:", err)
      alert("Failed to resend email. Please try again.")
    } finally {
      setResendingEmail(false)
    }
  }

  const openUpdateInvoiceDialog = (action: "PAID" | "CANCELLED") => {
    if (!invoice) {
      alert("No invoice found for this order")
      return
    }
    setInvoiceAction(action)
    setTransactionId(invoice.transactionId || "")
    setUpdateInvoiceDialogOpen(true)
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-400/20 dark:text-yellow-400"
      case "OVERDUE":
        return "bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400"
      case "CANCELLED":
        return "bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isInvoiceOverdue = (dueDate: string, status: string) => {
    if (status !== "PENDING") return false
    return new Date(dueDate) < new Date()
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-600 dark:text-green-400"
      case "Unpaid":
        return "text-orange-600 dark:text-orange-400"
      case "Partially Refunded":
        return "text-gray-600 dark:text-gray-400"
      case "Refunded":
        return "text-red-600 dark:text-red-400"
      default:
        return "theme-text"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-400"
      case "Incomplete":
        return "bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400"
      case "Cancelled":
        return "bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin theme-primary" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div className="theme-card rounded-xl p-6 text-center">
          <p className="text-destructive">{error || "Order not found"}</p>
          <button
            onClick={() => router.push("/admin/orders")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/orders")}
            className="p-2 hover:bg-muted rounded-lg transition-colors theme-muted hover:theme-text"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-bold theme-text mb-2">Edit order</h1>
            <p className="text-sm theme-muted">
              Order #{order.id} details
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/admin/orders")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add order
        </button>
      </div>

      {/* Order Details Header */}
      <div className="theme-card rounded-xl p-6">
        <h2 className="text-xl font-semibold theme-text mb-2">
          Order #{order.id} details
        </h2>
        <p className="text-sm theme-muted">
          Payment via {order.method}.{" "}
          <span className={getPaymentStatusColor(order.paymentStatus)}>
            {order.paymentStatus}
          </span>
          {order.paymentStatus === "Paid" && order.rawDate && (
            <> Paid on {formatDateTime(order.rawDate)}</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Section */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b border-border pb-2">
              General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  Date created:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={
                      order.rawDate
                        ? new Date(order.rawDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                      const time = order.rawDate
                        ? new Date(order.rawDate).toTimeString().slice(0, 5)
                        : "00:00"
                      setEditValues({
                        ...editValues,
                        dateCreated: `${date}T${time}:00`,
                      })
                    }}
                    className="px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="time"
                    value={
                      order.rawDate
                        ? new Date(order.rawDate).toTimeString().slice(0, 5)
                        : "00:00"
                    }
                    onChange={(e) => {
                      const date = order.rawDate
                        ? new Date(order.rawDate).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                      setEditValues({
                        ...editValues,
                        dateCreated: `${date}T${e.target.value}:00`,
                      })
                    }}
                    className="px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  Payment Status:
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => {
                    setEditValues({ ...editValues, paymentStatus: e.target.value })
                  }}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Refunded">Partially Refunded</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  Order Status:
                </label>
                <div className="px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium theme-text mb-1">
                  Customer:
                </label>
                <div className="flex items-center gap-2">
                  <span className="theme-text">
                    {order.name} {order.email && `(${order.email})`}
                  </span>
                  <button className="text-primary hover:underline text-sm">
                    Profile
                  </button>
                  <span className="theme-muted">|</span>
                  <button className="text-primary hover:underline text-sm">
                    View other orders →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Section */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold theme-text border-b border-border pb-2 flex-1">
                Billing
              </h3>
              <button
                onClick={() => setEditingField(editingField === "billing" ? null : "billing")}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <Edit2 size={16} className="theme-muted" />
              </button>
            </div>
            {editingField === "billing" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={order.name}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Address
                  </label>
                  <textarea
                    defaultValue={order.address}
                    onChange={(e) =>
                      setEditValues({ ...editValues, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium theme-text mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      defaultValue={order.city}
                      onChange={(e) =>
                        setEditValues({ ...editValues, city: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      defaultValue={order.country}
                      onChange={(e) =>
                        setEditValues({ ...editValues, country: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Email address:
                  </label>
                  <input
                    type="email"
                    defaultValue={order.email}
                    onChange={(e) =>
                      setEditValues({ ...editValues, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Phone:
                  </label>
                  <input
                    type="tel"
                    defaultValue={`${order.telephoneCountryCode} ${order.telephone}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(" ")
                      setEditValues({
                        ...editValues,
                        telephoneCountryCode: parts[0] || order.telephoneCountryCode,
                        telephone: parts.slice(1).join(" ") || order.telephone,
                      })
                    }}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingField(null)
                      setEditValues({})
                    }}
                    className="px-4 py-2 bg-input border border-border rounded-lg text-sm theme-text hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm theme-text">
                <p>{order.name}</p>
                <p>{order.address}</p>
                <p>
                  {order.city}, {order.country}
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> {order.email}
                </p>
                <p>
                  <strong>Phone:</strong> {order.telephoneCountryCode}{" "}
                  {order.telephone}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Section */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold theme-text border-b border-border pb-2 flex-1">
                Shipping
              </h3>
              <button
                onClick={() => setEditingField(editingField === "shipping" ? null : "shipping")}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <Edit2 size={16} className="theme-muted" />
              </button>
            </div>
            {editingField === "shipping" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={order.name}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text mb-1">
                    Address
                  </label>
                  <textarea
                    defaultValue={order.address}
                    rows={3}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium theme-text mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      defaultValue={order.city}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      defaultValue={order.country}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-4 py-2 bg-input border border-border rounded-lg text-sm theme-text hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm theme-text">
                <p>{order.name}</p>
                <p>{order.address}</p>
                <p>
                  {order.city}, {order.country}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b border-border pb-2">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.schedule ? (
                    <tr>
                      <td className="px-4 py-3 theme-text">
                        {order.courseTitle || order.schedule.program?.programName || "Course"}
                        {order.schedule.venue && (
                          <span className="block text-xs theme-muted mt-1">
                            {order.schedule.venue}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 theme-text">
                        ${order.schedule.fee?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 theme-text">1</td>
                      <td className="px-4 py-3 theme-text font-semibold">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center theme-muted">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b border-border pb-2">
              Order actions
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={orderAction}
                  onChange={(e) => setOrderAction(e.target.value)}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Choose an action...</option>
                  <option value="mark_completed">Mark as Completed</option>
                  <option value="mark_incomplete">Mark as Incomplete</option>
                  <option value="mark_cancelled">Mark as Cancelled</option>
                  <option value="notify_customer">Notify Customer</option>
                  <option value="send_invoice">Send Invoice</option>
                  
                
                </select>
                <button
                  onClick={handleOrderAction}
                  disabled={!orderAction || saving}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "→"
                  )}
                </button>
              </div>
              <button
                onClick={handleMoveToTrash}
                className="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm"
              >
                Move to Trash
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={saving || Object.keys(editValues).length === 0}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update"
                )}
              </button>
            </div>

            {/* Invoice Management Section - Show for all orders */}
            <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={18} className="theme-text" />
                  <h4 className="text-sm font-semibold theme-text">Invoice Management</h4>
                </div>

                {invoiceLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin theme-primary" />
                  </div>
                ) : invoice ? (
                  <div className="space-y-3">
                    {/* Invoice Info */}
                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs theme-muted">Invoice Number:</span>
                        <span className="text-sm font-semibold theme-text">{invoice.invoiceNo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs theme-muted">Amount:</span>
                        <span className="text-sm font-semibold theme-text">
                          ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs theme-muted">Status:</span>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                          {isInvoiceOverdue(invoice.dueDate, invoice.status) && " (Overdue)"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs theme-muted">Due Date:</span>
                        <span className={`text-xs ${isInvoiceOverdue(invoice.dueDate, invoice.status) ? "text-red-500 font-medium" : "theme-text"}`}>
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {invoice.paymentDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs theme-muted">Paid On:</span>
                          <span className="text-xs theme-text">
                            {format(new Date(invoice.paymentDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Invoice Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {invoice.pdfUrl && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(invoice.pdfUrl || "", "_blank")}
                            className="text-xs"
                            title="View PDF"
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = invoice.pdfUrl || ""
                              link.download = `${invoice.invoiceNo}.pdf`
                              link.click()
                            }}
                            className="text-xs"
                            title="Download PDF"
                          >
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendInvoiceEmail}
                        disabled={resendingEmail}
                        className="text-xs"
                        title="Resend Email"
                      >
                        {resendingEmail ? (
                          <Loader2 size={14} className="mr-1 animate-spin" />
                        ) : (
                          <Mail size={14} className="mr-1" />
                        )}
                        Resend
                      </Button>
                      {invoice.status !== "PAID" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateInvoiceDialog("PAID")}
                          className="text-xs text-green-600 hover:text-green-700"
                          title="Mark as Paid"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Mark Paid
                        </Button>
                      )}
                      {invoice.status !== "CANCELLED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateInvoiceDialog("CANCELLED")}
                          className="text-xs text-red-600 hover:text-red-700"
                          title="Cancel Invoice"
                        >
                          <XCircle size={14} className="mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs theme-muted">No invoice found for this order</p>
                  </div>
                )}
              </div>
          </div>

          {/* Order Notes */}
          <div className="theme-card rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b border-border pb-2">
              Order notes
            </h3>
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg ${
                    note.isPrivate
                      ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm theme-text">{note.note}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs theme-muted">
                      {formatDateTime(note.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Delete note
                    </button>
                  </div>
                </div>
              ))}
              <div className="space-y-3 pt-3 border-t border-border">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={4}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                />
                <select
                  value={isPrivateNote ? "private" : "public"}
                  onChange={(e) => setIsPrivateNote(e.target.value === "private")}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="public">Public note</option>
                  <option value="private">Private note</option>
                </select>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Invoice Status Dialog */}
      <Dialog open={updateInvoiceDialogOpen} onOpenChange={setUpdateInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {invoiceAction === "PAID" ? "Mark Invoice as Paid" : "Cancel Invoice"}
            </DialogTitle>
            <DialogDescription>
              {invoice && (
                <>
                  Invoice: <strong>{invoice.invoiceNo}</strong>
                  <br />
                  Customer: <strong>{invoice.customerName}</strong>
                  <br />
                  Amount: <strong>${invoice.amount.toFixed(2)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {invoiceAction === "PAID" && (
              <div>
                <label className="text-sm font-medium theme-text mb-2 block">
                  Transaction ID (Optional)
                </label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction reference"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInvoiceStatus} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

