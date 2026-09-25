"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, BookOpen, User, MapPin, CreditCard, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface RegistrationDetail {
  id: string
  courseId: string | null
  courseTitle: string | null
  scheduleId: string | null
  schedule: {
    id: string
    startDate: string
    endDate: string | null
    venue: string | null
    fee: number | null
    status: string
    program: {
      id: string
      programName: string
      refCode: string | null
    } | null
  } | null
  program: {
    id: string
    programName: string
    refCode: string | null
  } | null
  title: string | null
  name: string
  email: string
  designation: string | null
  company: string | null
  address: string
  city: string
  country: string
  telephone: string
  telephoneCountryCode: string
  mobile: string | null
  mobileCountryCode: string | null
  paymentMethod: string
  paymentMethodLabel: string
  paymentStatus: string | null
  orderStatus: string | null
  participants: number
  differentBilling: boolean
  acceptTerms: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
  fee: number | null
  totalAmount: number | null
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium theme-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm theme-text break-words">{value || "—"}</p>
    </div>
  )
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return format(d, "MMM dd, yyyy")
  } catch {
    return "—"
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return format(d, "MMM dd, yyyy · h:mm a")
  } catch {
    return "—"
  }
}

function money(amount: number | null | undefined) {
  if (amount == null || !Number.isFinite(Number(amount))) return "—"
  return `$${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function RegistrationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/registrations/${id}`)
        const result = await res.json()
        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to load registration")
        }
        setRegistration(result.data)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to load registration")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 theme-bg flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin theme-primary" />
      </div>
    )
  }

  if (error || !registration) {
    return (
      <div className="p-8 theme-bg space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin?page=registrations")}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Registrations
        </Button>
        <div className="theme-card rounded-xl p-6 text-center">
          <p className="text-destructive">{error || "Registration not found"}</p>
        </div>
      </div>
    )
  }

  const scheduleRange =
    registration.schedule?.startDate
      ? registration.schedule.endDate &&
        new Date(registration.schedule.startDate).getTime() !==
          new Date(registration.schedule.endDate).getTime()
        ? `${formatDate(registration.schedule.startDate)} – ${formatDate(registration.schedule.endDate)}`
        : formatDate(registration.schedule.startDate)
      : "—"

  const courseName =
    registration.courseTitle ||
    registration.program?.programName ||
    registration.schedule?.program?.programName ||
    "—"

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin?page=registrations")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold theme-text mb-1">Registration Details</h1>
            <p className="theme-muted text-sm">
              Submitted {formatDateTime(registration.submittedAt || registration.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {registration.orderStatus && (
            <Badge variant="outline">{registration.orderStatus}</Badge>
          )}
          {registration.paymentStatus && (
            <Badge variant="outline">{registration.paymentStatus}</Badge>
          )}
          <Badge className="bg-primary/15 text-primary border-0">
            {registration.paymentMethodLabel}
          </Badge>
        </div>
      </div>

      {/* Course registered for */}
      <section className="theme-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <BookOpen size={18} className="theme-primary" />
          <h2 className="text-lg font-semibold theme-text">Course Registered For</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Course / Program" value={courseName} />
          <Field
            label="Ref Code"
            value={
              registration.program?.refCode ||
              registration.schedule?.program?.refCode ||
              "—"
            }
          />
          <Field label="Participants" value={String(registration.participants || 1)} />
          <Field label="Schedule Dates" value={scheduleRange} />
          <Field label="Venue" value={registration.schedule?.venue} />
          <Field label="Fee (per participant)" value={money(registration.fee)} />
          <Field label="Total Amount" value={money(registration.totalAmount)} />
          <Field label="Schedule Status" value={registration.schedule?.status} />
        </div>
      </section>

      {/* Personal details entered at registration */}
      <section className="theme-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User size={18} className="theme-primary" />
          <h2 className="text-lg font-semibold theme-text">Delegate Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Title" value={registration.title} />
          <Field label="Full Name" value={registration.name} />
          <Field label="Email" value={registration.email} />
          <Field label="Designation / Position" value={registration.designation} />
          <Field label="Company" value={registration.company} />
        </div>
      </section>

      {/* Contact & address */}
      <section className="theme-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <MapPin size={18} className="theme-primary" />
          <h2 className="text-lg font-semibold theme-text">Address & Contact</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Address" value={registration.address} />
          <Field label="City" value={registration.city} />
          <Field label="Country" value={registration.country} />
          <Field
            label="Telephone"
            value={`${registration.telephoneCountryCode || ""} ${registration.telephone || ""}`.trim()}
          />
          <Field
            label="Mobile"
            value={
              registration.mobile
                ? `${registration.mobileCountryCode || ""} ${registration.mobile}`.trim()
                : "—"
            }
          />
          <Field
            label="Different Billing Address"
            value={registration.differentBilling ? "Yes" : "No"}
          />
        </div>
      </section>

      {/* Payment */}
      <section className="theme-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <CreditCard size={18} className="theme-primary" />
          <h2 className="text-lg font-semibold theme-text">Payment & Terms</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Payment Method" value={registration.paymentMethodLabel} />
          <Field label="Payment Status" value={registration.paymentStatus} />
          <Field label="Order Status" value={registration.orderStatus} />
          <Field
            label="Accepted Terms"
            value={registration.acceptTerms ? "Yes" : "No"}
          />
        </div>
      </section>

      {/* Meta */}
      <section className="theme-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Calendar size={18} className="theme-primary" />
          <h2 className="text-lg font-semibold theme-text">Record Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Registration ID" value={registration.id} />
          <Field label="Submitted At" value={formatDateTime(registration.submittedAt)} />
          <Field label="Last Updated" value={formatDateTime(registration.updatedAt)} />
        </div>
      </section>
    </div>
  )
}
