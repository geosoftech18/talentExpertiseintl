"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateOrderPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  // Form state for creating order
  const [formData, setFormData] = useState({
    // Personal Information
    title: "",
    name: "",
    email: "",
    designation: "",
    company: "",
    // Address Information
    address: "",
    city: "",
    country: "",
    telephone: "",
    mobile: "",
    // Course Information
    courseId: "",
    scheduleId: "",
    courseTitle: "",
    // Payment Information
    paymentMethod: "",
    paymentStatus: "Unpaid",
    orderStatus: "Incomplete",
    participants: "1",
  })

  // Fetch courses and schedules for dropdowns
  const [courses, setCourses] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(false)

  // Fetch programs for dropdown
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingCourses(true)
        const response = await fetch("/api/admin/programs?limit=1000")
        const result = await response.json()

        if (result.success) {
          // Transform programs for dropdown
          const transformedPrograms = result.data.map((program: any) => ({
            id: program.id,
            title: program.programName,
            refCode: program.refCode,
          }))
          setCourses(transformedPrograms)
        }
      } catch (err) {
        console.error("Error fetching programs:", err)
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchPrograms()
  }, [])

  // Fetch schedules when program is selected
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!formData.courseId) {
        setSchedules([])
        return
      }

      try {
        setLoadingSchedules(true)
        const response = await fetch("/api/schedules?limit=1000")
        const result = await response.json()

        if (result.success) {
          // Filter schedules for selected program
          const programSchedules = result.data
            .filter((schedule: any) => schedule.programId === formData.courseId)
            .map((schedule: any) => ({
              id: schedule.scheduleId,
              programId: schedule.programId,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              venue: schedule.venue,
              fee: schedule.price,
            }))
          setSchedules(programSchedules)
        }
      } catch (err) {
        console.error("Error fetching schedules:", err)
        setSchedules([])
      } finally {
        setLoadingSchedules(false)
      }
    }

    fetchSchedules()
  }, [formData.courseId])

  // Update course title when schedule is selected
  useEffect(() => {
    if (formData.scheduleId) {
      const selectedSchedule = schedules.find((s) => s.id === formData.scheduleId)
      if (selectedSchedule) {
        const selectedCourse = courses.find((c) => c.id === formData.courseId)
        if (selectedCourse) {
          setFormData((prev) => ({ ...prev, courseTitle: selectedCourse.title }))
        }
      }
    }
  }, [formData.scheduleId, formData.courseId, schedules, courses])

  const formatScheduleDisplay = (schedule: any) => {
    if (!schedule) return ""
    const startDate = schedule.startDate ? new Date(schedule.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'
    const endDate = schedule.endDate ? new Date(schedule.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : startDate
    const venue = schedule.venue || 'TBA'
    const fee = schedule.fee ? `$${schedule.fee.toLocaleString()}` : 'TBA'
    
    if (startDate === endDate) {
      return `${startDate} | ${venue} | ${fee}`
    }
    return `${startDate} - ${endDate} | ${venue} | ${fee}`
  }

  const handleCreateOrder = async () => {
    setIsCreating(true)
    setCreateError(null)

    try {
      // Validate required fields - mobile is now required instead of telephone
      if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.country || !formData.mobile || !formData.paymentMethod) {
        setCreateError("Please fill in all required fields")
        setIsCreating(false)
        return
      }

      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Remove country code fields from the request
          telephoneCountryCode: undefined,
          mobileCountryCode: undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Navigate back to orders page
        router.push("/admin/orders")
      } else {
        setCreateError(result.error || "Failed to create order")
      }
    } catch (err) {
      console.error("Error creating order:", err)
      setCreateError("Failed to create order. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/orders")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        <h1 className="text-4xl font-bold theme-text">Create New Order</h1>
      </div>

      {/* Form */}
      <div className="theme-card rounded-xl p-6 shadow-lg max-w-4xl">
        <div className="space-y-6">
          {createError && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {createError}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Job title"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b pb-2">Address Information</h3>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Telephone number"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Mobile number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b pb-2">Course Information</h3>
            <div>
              <Label htmlFor="courseId">Program/Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => {
                  const selectedProgram = courses.find((c) => c.id === value)
                  setFormData({
                    ...formData,
                    courseId: value,
                    courseTitle: selectedProgram?.title || "",
                    scheduleId: "", // Reset schedule when program changes
                  })
                }}
                disabled={loadingCourses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Loading programs..." : "Select program"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.title} {program.refCode ? `(${program.refCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduleId">Schedule</Label>
              <Select
                value={formData.scheduleId}
                onValueChange={(value) => setFormData({ ...formData, scheduleId: value })}
                disabled={!formData.courseId || loadingSchedules}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.courseId
                        ? "Select course first"
                        : loadingSchedules
                          ? "Loading schedules..."
                          : "Select schedule"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {formatScheduleDisplay(schedule)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b pb-2">Payment Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="purchase">Purchase Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partially Refunded">Partially Refunded</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select
                  value={formData.orderStatus}
                  onValueChange={(value) => setFormData({ ...formData, orderStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/orders")}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

