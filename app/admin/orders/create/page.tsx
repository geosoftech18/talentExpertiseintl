"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, CheckIcon, ChevronDownIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { WORLD_COUNTRY_NAMES } from "@/lib/world-countries"

const phoneCountries = [
  { code: "+971", name: "United Arab Emirates", iso: "ae" },
  { code: "+1", name: "United States", iso: "us" },
  { code: "+44", name: "United Kingdom", iso: "gb" },
  { code: "+65", name: "Singapore", iso: "sg" },
  { code: "+966", name: "Saudi Arabia", iso: "sa" },
  { code: "+974", name: "Qatar", iso: "qa" },
  { code: "+968", name: "Oman", iso: "om" },
  { code: "+965", name: "Kuwait", iso: "kw" },
  { code: "+973", name: "Bahrain", iso: "bh" },
  { code: "+91", name: "India", iso: "in" },
  { code: "+86", name: "China", iso: "cn" },
  { code: "+81", name: "Japan", iso: "jp" },
  { code: "+49", name: "Germany", iso: "de" },
  { code: "+33", name: "France", iso: "fr" },
  { code: "+39", name: "Italy", iso: "it" },
  { code: "+34", name: "Spain", iso: "es" },
  { code: "+61", name: "Australia", iso: "au" },
  { code: "+27", name: "South Africa", iso: "za" },
  { code: "+234", name: "Nigeria", iso: "ng" },
  { code: "+254", name: "Kenya", iso: "ke" },
  { code: "+20", name: "Egypt", iso: "eg" },
  { code: "+60", name: "Malaysia", iso: "my" },
  { code: "+66", name: "Thailand", iso: "th" },
  { code: "+62", name: "Indonesia", iso: "id" },
  { code: "+84", name: "Vietnam", iso: "vn" },
  { code: "+82", name: "South Korea", iso: "kr" },
]

const getCountryISO = (phoneCode: string): string => {
  return phoneCountries.find((c) => c.code === phoneCode)?.iso || "xx"
}

const getFlagImageUrl = (phoneCode: string): string => {
  const isoCode = getCountryISO(phoneCode)
  return `https://flagcdn.com/w40/${isoCode}.png`
}

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
    telephoneCountryCode: "+971",
    mobile: "",
    mobileCountryCode: "+971",
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
  const [courseSearchOpen, setCourseSearchOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [countrySearchOpen, setCountrySearchOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

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
        // Use admin schedules endpoint so create-order can see all schedules
        // (including unpublished/expired ones), not only public upcoming schedules.
        // includeExpired=true is required here because some valid ongoing schedules
        // may have startDate in the past but endDate still active.
        const response = await fetch("/api/admin/schedules?limit=10000&includeExpired=true")
        const result = await response.json()

        if (result.success) {
          const selectedProgram = courses.find((c) => c.id === formData.courseId)
          const normalize = (value?: string | null) => (value || "").trim().toLowerCase()
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          // Filter schedules for selected program
          const programSchedules = result.data
            .filter((schedule: any) => {
              const matchesProgramId = schedule.programId === formData.courseId
              const matchesProgramRelation = schedule.program?.id === formData.courseId
              const matchesLegacyProgramName =
                !matchesProgramId &&
                !matchesProgramRelation &&
                normalize(schedule.programName) === normalize(selectedProgram?.title)

              const belongsToSelectedProgram =
                matchesProgramId || matchesProgramRelation || matchesLegacyProgramName

              if (!belongsToSelectedProgram) return false

              // Keep only non-expired schedules:
              // - If endDate exists, endDate must be today or later
              // - Else startDate must be today or later
              const scheduleEndOrStart = new Date(schedule.endDate || schedule.startDate)
              scheduleEndOrStart.setHours(0, 0, 0, 0)
              return scheduleEndOrStart >= today
            })
            .map((schedule: any) => ({
              id: schedule.id,
              programId: schedule.programId,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              venue: schedule.venue,
              fee: schedule.fee,
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
  }, [formData.courseId, courses])

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

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase()
    if (!query) return courses

    return courses.filter((program) => {
      const title = (program.title || "").toLowerCase()
      const refCode = (program.refCode || "").toLowerCase()
      return title.includes(query) || refCode.includes(query)
    })
  }, [courses, courseSearch])

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase()
    if (!query) return WORLD_COUNTRY_NAMES

    return WORLD_COUNTRY_NAMES.filter((country) =>
      country.toLowerCase().includes(query)
    )
  }, [countrySearch])

  const handleCreateOrder = async () => {
    setIsCreating(true)
    setCreateError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.city || !formData.country || !formData.mobile || !formData.paymentMethod) {
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
                    <SelectItem value="Eng">Eng</SelectItem>
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
              <Label htmlFor="address">Address</Label>
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
                <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countrySearchOpen}
                      className="w-full justify-between bg-input border-border theme-text h-10 font-normal"
                    >
                      <span className="truncate">{formData.country || "Select country"}</span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search country..."
                        value={countrySearch}
                        onValueChange={setCountrySearch}
                      />
                      <CommandList>
                        <CommandEmpty>No country found matching "{countrySearch}".</CommandEmpty>
                        <CommandGroup>
                          {filteredCountries.map((country) => (
                            <CommandItem
                              key={country}
                              value={country}
                              onSelect={() => {
                                setFormData({ ...formData, country })
                                setCountrySearchOpen(false)
                                setCountrySearch("")
                              }}
                              className="cursor-pointer"
                            >
                              <CheckIcon
                                className={`mr-2 h-4 w-4 ${formData.country === country ? "opacity-100" : "opacity-0"}`}
                              />
                              <span>{country}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telephone">Telephone</Label>
                <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <Select
                    value={formData.telephoneCountryCode}
                    onValueChange={(value) => setFormData({ ...formData, telephoneCountryCode: value })}
                  >
                    <SelectTrigger className="w-auto min-w-[100px] h-10 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                          <Image
                            src={getFlagImageUrl(formData.telephoneCountryCode)}
                            alt={phoneCountries.find(c => c.code === formData.telephoneCountryCode)?.name || "Country flag"}
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{formData.telephoneCountryCode}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {phoneCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image src={getFlagImageUrl(country.code)} alt={country.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            </div>
                            <span className="text-sm">{country.name}</span>
                            <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="Telephone number"
                    className="h-10 text-sm border-0 rounded-none focus-visible:ring-0 flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <Select
                    value={formData.mobileCountryCode}
                    onValueChange={(value) => setFormData({ ...formData, mobileCountryCode: value })}
                  >
                    <SelectTrigger className="w-auto min-w-[100px] h-10 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                          <Image
                            src={getFlagImageUrl(formData.mobileCountryCode)}
                            alt={phoneCountries.find(c => c.code === formData.mobileCountryCode)?.name || "Country flag"}
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{formData.mobileCountryCode}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {phoneCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image src={getFlagImageUrl(country.code)} alt={country.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            </div>
                            <span className="text-sm">{country.name}</span>
                            <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Mobile number"
                    required
                    className="h-10 text-sm border-0 rounded-none focus-visible:ring-0 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text border-b pb-2">Course Information</h3>
            <div>
              <Label htmlFor="courseId">Program/Course</Label>
              <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courseSearchOpen}
                    disabled={loadingCourses}
                    className="w-full justify-between bg-input border-border theme-text h-10 font-normal"
                  >
                    <span className="truncate">
                      {formData.courseId
                        ? (() => {
                            const selectedProgram = courses.find((c) => c.id === formData.courseId)
                            return selectedProgram
                              ? `${selectedProgram.title}${selectedProgram.refCode ? ` (${selectedProgram.refCode})` : ""}`
                              : "Select program"
                          })()
                        : loadingCourses
                          ? "Loading programs..."
                          : "Select program"}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by program name or ref code..."
                      value={courseSearch}
                      onValueChange={setCourseSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No program found matching "{courseSearch}".</CommandEmpty>
                      <CommandGroup>
                        {filteredCourses.map((program) => (
                          <CommandItem
                            key={program.id}
                            value={`${program.title} ${program.refCode || ""}`}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                courseId: program.id,
                                courseTitle: program.title || "",
                                scheduleId: "", // Reset schedule when program changes
                              })
                              setCourseSearchOpen(false)
                              setCourseSearch("")
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={`mr-2 h-4 w-4 ${
                                formData.courseId === program.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <span>
                              {program.title} {program.refCode ? `(${program.refCode})` : ""}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                    <SelectItem value="credit">Stripe</SelectItem>
           
                    <SelectItem value="invoice">Invoice</SelectItem>
                    
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
                    <SelectItem value="Incomplete">Inprogress</SelectItem>
                    
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

