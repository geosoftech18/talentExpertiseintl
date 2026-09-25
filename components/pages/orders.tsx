"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  RefreshCw,
  Calendar,
  ChevronUp,
  ChevronDown,
  Edit,
  Loader2,
  Plus,
  Trash2,
  Download,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import * as XLSX from "xlsx"

interface Order {
  id: number
  registrationId?: string
  name: string
  email?: string
  company?: string
  courseTitle?: string
  date: string
  rawDate?: Date
  scheduleDate?: string | null
  scheduleStartDate?: string | null
  scheduleEndDate?: string | null
  method: string
  paymentStatus: "Paid" | "Unpaid" | "Partially Refunded" | "Refunded"
  status: "Completed" | "Incomplete" | "Cancelled"
  total: number
}

function toDayStart(value: string | Date): Date {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Orders() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"all" | "incomplete" | "completed" | "cancelled" | "trash">("all")
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("")
  const [scheduleDateFilter, setScheduleDateFilter] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseSearchOpen, setCourseSearchOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin/orders?limit=1000")
        const result = await response.json()

        if (result.success) {
          setAllOrders(result.data || [])
        } else {
          setError(result.error || "Failed to fetch orders")
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])



  // Dummy data matching the image (fallback if no data)
  const dummyOrders: Order[] = [
    {
      id: 13,
      name: "Alice",
      date: "November 19, 2024, 5:35 am",
      method: "Klarna",
      paymentStatus: "Paid",
      status: "Completed",
      total: 500.0,
    },
    {
      id: 12,
      name: "James",
      date: "November 19, 2024, 5:35 am",
      method: "Klarna",
      paymentStatus: "Paid",
      status: "Completed",
      total: 500.0,
    },
    {
      id: 11,
      name: "Sara",
      date: "November 18, 2024, 8:36 pm",
      method: "Paystack",
      paymentStatus: "Paid",
      status: "Completed",
      total: 500.0,
    },
    {
      id: 10,
      name: "Steve",
      date: "November 18, 2024, 8:35 pm",
      method: "Paystack",
      paymentStatus: "Partially Refunded",
      status: "Completed",
      total: 500.0,
    },
    {
      id: 9,
      name: "Rodrigo",
      date: "November 18, 2024, 7:59 pm",
      method: "Razorpay",
      paymentStatus: "Unpaid",
      status: "Incomplete",
      total: 1.0,
    },
    {
      id: 8,
      name: "Tony",
      date: "November 18, 2024, 5:17 pm",
      method: "Mollie",
      paymentStatus: "Paid",
      status: "Completed",
      total: 1.0,
    },
    {
      id: 7,
      name: "Emma",
      date: "November 17, 2024, 3:45 pm",
      method: "Stripe",
      paymentStatus: "Paid",
      status: "Completed",
      total: 750.0,
    },
    {
      id: 6,
      name: "Michael",
      date: "November 17, 2024, 2:30 pm",
      method: "PayPal",
      paymentStatus: "Unpaid",
      status: "Incomplete",
      total: 300.0,
    },
    {
      id: 5,
      name: "Sophia",
      date: "November 16, 2024, 11:20 am",
      method: "Klarna",
      paymentStatus: "Paid",
      status: "Completed",
      total: 450.0,
    },
    {
      id: 4,
      name: "David",
      date: "November 16, 2024, 10:15 am",
      method: "Paystack",
      paymentStatus: "Unpaid",
      status: "Incomplete",
      total: 600.0,
    },
    {
      id: 3,
      name: "Olivia",
      date: "November 15, 2024, 4:50 pm",
      method: "Razorpay",
      paymentStatus: "Paid",
      status: "Completed",
      total: 550.0,
    },
    {
      id: 2,
      name: "William",
      date: "November 15, 2024, 3:25 pm",
      method: "Mollie",
      paymentStatus: "Unpaid",
      status: "Incomplete",
      total: 400.0,
    },
    {
      id: 1,
      name: "Isabella",
      date: "November 14, 2024, 1:10 pm",
      method: "Stripe",
      paymentStatus: "Paid",
      status: "Completed",
      total: 650.0,
    },
  ]

  // Use real data or fallback to dummy data if no data available
  const ordersToUse = allOrders.length > 0 ? allOrders : dummyOrders

  const courseOptions = useMemo(() => {
    const names = new Set<string>()
    for (const order of ordersToUse) {
      const title = order.courseTitle?.trim()
      if (title) names.add(title)
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [ordersToUse])

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courseOptions
    const q = courseSearch.toLowerCase()
    return courseOptions.filter((name) => name.toLowerCase().includes(q))
  }, [courseOptions, courseSearch])

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    let filtered = ordersToUse

    // Filter by tab
    if (activeTab === "incomplete") {
      filtered = filtered.filter((order) => order.status === "Incomplete")
    } else if (activeTab === "completed") {
      filtered = filtered.filter((order) => order.status === "Completed")
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((order) => order.status === "Cancelled")
    } else if (activeTab === "trash") {
      // For trash, you might want to filter deleted orders
      filtered = []
    }

    // Filter by payment status
    if (paymentStatusFilter) {
      filtered = filtered.filter((order) => order.paymentStatus === paymentStatusFilter)
    }

    // Filter by course (searchable dropdown)
    if (selectedCourse) {
      filtered = filtered.filter((order) => order.courseTitle === selectedCourse)
    }

    // Filter by search query (course name, user name, and existing fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (order) =>
          order.name.toLowerCase().includes(query) ||
          (order.courseTitle || "").toLowerCase().includes(query) ||
          order.id.toString().includes(query) ||
          order.method.toLowerCase().includes(query) ||
          order.email?.toLowerCase().includes(query) ||
          order.company?.toLowerCase().includes(query)
      )
    }

    // Filter by schedule date (not order date)
    if (scheduleDateFilter) {
      const filterDay = toDayStart(scheduleDateFilter).getTime()
      filtered = filtered.filter((order) => {
        if (!order.scheduleStartDate) return false
        const startDay = toDayStart(order.scheduleStartDate).getTime()
        const endDay = order.scheduleEndDate
          ? toDayStart(order.scheduleEndDate).getTime()
          : startDay
        return filterDay >= startDay && filterDay <= endDay
      })
    }

    // Sort newest first
    filtered = filtered.sort((a, b) => {
      if (a.rawDate && b.rawDate) {
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      }
      return b.id - a.id
    })

    return filtered
  }

  const filteredOrders = getFilteredOrders()

  // Count orders by status
  const orderCounts = {
    all: ordersToUse.length,
    incomplete: ordersToUse.filter((o) => o.status === "Incomplete").length,
    completed: ordersToUse.filter((o) => o.status === "Completed").length,
    cancelled: ordersToUse.filter((o) => o.status === "Cancelled").length,
    trash: 0,
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "Unpaid":
        return "bg-orange-500/20 text-orange-500 dark:bg-orange-400/20 dark:text-orange-400"
      case "Partially Refunded":
        return "bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400"
      case "Refunded":
        return "bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setPaymentStatusFilter("")
    setScheduleDateFilter("")
    setSelectedCourse("")
    setCourseSearch("")
    setSelectedOrders([])
  }

  const handleExportExcel = () => {
    const ordersToExport =
      selectedOrders.length > 0
        ? filteredOrders.filter((order) => selectedOrders.includes(order.id))
        : filteredOrders

    if (ordersToExport.length === 0) {
      alert("No orders available to export")
      return
    }

    const exportData = ordersToExport.map((order) => ({
      ID: `#${order.id}`,
      Name: order.name,
      Email: order.email || "",
      Company: order.company || "",
      Course: order.courseTitle || "",
      "Course Schedule Date": order.scheduleDate || "",
      "Order Date": order.date,
      Method: order.method,
      "Payment Status": order.paymentStatus,
      Status: order.status,
      Total: order.total,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")

    const selectedText = selectedOrders.length > 0 ? `_${selectedOrders.length}_selected` : "_all"
    const filename = `orders_export_${new Date().toISOString().split("T")[0]}${selectedText}`
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const handleDeleteOrder = async (order: Order) => {
    if (!order.registrationId) {
      alert("This order cannot be deleted.")
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete order #${order.id}? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/orders/${order.registrationId}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Failed to delete order")
      }

      setAllOrders((prev) => prev.filter((o) => o.registrationId !== order.registrationId))
      setSelectedOrders((prev) => prev.filter((id) => id !== order.id))
    } catch (err) {
      console.error("Error deleting order:", err)
      alert(err instanceof Error ? err.message : "Failed to delete order. Please try again.")
    }
  }



  if (loading) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Orders</h1>
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
          <h1 className="text-4xl font-bold theme-text mb-2">Orders</h1>
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
      {/* Title and Create Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold theme-text mb-2">Orders</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportExcel}
            disabled={filteredOrders.length === 0}
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
            title={
              selectedOrders.length > 0
                ? `Export ${selectedOrders.length} selected order(s)`
                : "Export all filtered orders"
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
            {selectedOrders.length > 0 ? ` (${selectedOrders.length})` : " (All)"}
          </Button>
          <Button
            onClick={() => router.push("/admin/orders/create")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === "all"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          All ({orderCounts.all})
        </button>
        <button
          onClick={() => setActiveTab("incomplete")}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === "incomplete"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Incomplete ({orderCounts.incomplete})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === "completed"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Completed ({orderCounts.completed})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === "cancelled"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Cancelled ({orderCounts.cancelled})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === "trash"
              ? "text-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Trash ({orderCounts.trash})
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Bulk Action */}
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
            <option>Bulk Action</option>
            <option>Mark as Completed</option>
            <option>Mark as Cancelled</option>
            <option>Delete</option>
          </select>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Apply
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-input border border-border rounded-lg theme-text text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw size={16} />
          Reset
        </button>

        {/* Payment Status Filter */}
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-4 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">Payment Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Refunded">Partially Refunded</option>
          <option value="Refunded">Refunded</option>
        </select>

        {/* Course Filter (searchable) */}
        <div className="w-full sm:w-[260px]">
          <Popover
            open={courseSearchOpen}
            onOpenChange={(open) => {
              setCourseSearchOpen(open)
              if (!open) setCourseSearch("")
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={courseSearchOpen}
                className="w-full justify-between bg-input border-border theme-text h-10 font-normal text-sm"
              >
                <span className="truncate">
                  {selectedCourse || "All courses"}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search courses..."
                  value={courseSearch}
                  onValueChange={setCourseSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    No course found matching &quot;{courseSearch}&quot;.
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__all__"
                      onSelect={() => {
                        setSelectedCourse("")
                        setCourseSearchOpen(false)
                        setCourseSearch("")
                      }}
                      className="cursor-pointer"
                    >
                      <CheckIcon
                        className={`mr-2 h-4 w-4 ${
                          !selectedCourse ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <span>All courses</span>
                    </CommandItem>
                    {filteredCourses.map((course) => (
                      <CommandItem
                        key={course}
                        value={course}
                        onSelect={() => {
                          setSelectedCourse(course)
                          setCourseSearchOpen(false)
                          setCourseSearch("")
                        }}
                        className="cursor-pointer"
                      >
                        <CheckIcon
                          className={`mr-2 h-4 w-4 ${
                            selectedCourse === course ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span className="truncate">{course}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Schedule Date Filter */}
        <div className="relative" title="Filter by course schedule date">
          <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="date"
            value={scheduleDateFilter}
            onChange={(e) => setScheduleDateFilter(e.target.value)}
            aria-label="Filter by schedule date"
            className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search by course name or user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">
                  <div className="flex items-center gap-2">
                    ID
                    <div className="flex flex-col">
                      <ChevronUp size={12} className="theme-muted" />
                      <ChevronDown size={12} className="theme-muted -mt-1" />
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course Schedule Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">
                  <div className="flex items-center gap-2">
                   Order Date
                    {/* <div className="flex flex-col">
                      <ChevronUp size={12} className="theme-muted" />
                      <ChevronDown size={12} className="theme-muted -mt-1" />
                    </div> */}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Payment Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">
                  <div className="flex items-center gap-2">
                    Total
                    {/* <div className="flex flex-col">
                      <ChevronUp size={12} className="theme-muted" />
                      <ChevronDown size={12} className="theme-muted -mt-1" />
                    </div> */}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center theme-muted">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 theme-text font-medium">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {getInitials(order.name)}
                        </div>
                        <span className="theme-text font-medium">{order.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 theme-text text-sm max-w-[220px]">
                      <span className="line-clamp-2" title={order.courseTitle || undefined}>
                        {order.courseTitle || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 theme-muted text-sm">{order.scheduleDate || "—"}</td>
                    <td className="px-6 py-4 theme-muted text-sm">{order.date}</td>
                    <td className="px-6 py-4 theme-text">{order.method}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 theme-text font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (order.registrationId) {
                              router.push(`/admin/orders/${order.registrationId}`)
                            }
                          }}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="px-3 py-1 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

