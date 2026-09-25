"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Eye, Download, Loader2, Award, CheckIcon, ChevronDownIcon, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

interface IssuedCertificate {
  id: string
  registrationId: string
  name: string
  email: string
  courseName: string
  certificateNumber: string
  schedule: string
  venue: string | null
  submittedAt: string
}

export default function IssuedCertificates() {
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseSearchOpen, setCourseSearchOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin/issued-certificates?limit=2000")
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch certificates")
        }

        setCertificates(result.data || [])
      } catch (err) {
        console.error("Error fetching issued certificates:", err)
        setError(err instanceof Error ? err.message : "Failed to load certificates")
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const courseOptions = useMemo(() => {
    const names = new Set<string>()
    for (const c of certificates) {
      const name = c.courseName?.trim()
      if (name) names.add(name)
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [certificates])

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courseOptions
    const q = courseSearch.toLowerCase()
    return courseOptions.filter((name) => name.toLowerCase().includes(q))
  }, [courseOptions, courseSearch])

  const filtered = useMemo(() => {
    let list = certificates

    if (selectedCourse) {
      list = list.filter((c) => c.courseName === selectedCourse)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          c.certificateNumber.toLowerCase().includes(q) ||
          c.schedule.toLowerCase().includes(q)
      )
    }

    return list
  }, [certificates, searchQuery, selectedCourse])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleExportExcel = () => {
    const selected = Array.from(selectedIds)
    const dataToExport =
      selected.length > 0
        ? filtered.filter((c) => selectedIds.has(c.id))
        : filtered

    if (dataToExport.length === 0) {
      alert("No data available to export")
      return
    }

    const exportData = dataToExport.map((cert) => ({
      Name: cert.name,
      Email: cert.email,
      "Course Name": cert.courseName,
      "Certificate Number": cert.certificateNumber,
      Schedule: cert.schedule,
      Venue: cert.venue || "",
      "Submitted Date": cert.submittedAt
        ? new Date(cert.submittedAt).toISOString().split("T")[0]
        : "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issued Certificates")

    const selectedText =
      selected.length > 0 ? `_${selected.length}_selected` : "_all"
    const filename = `issued_certificates_${new Date().toISOString().split("T")[0]}${selectedText}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const openPdf = async (registrationId: string, download: boolean) => {
    try {
      setBusyId(registrationId)
      const params = new URLSearchParams()
      if (download) params.set("download", "1")
      const response = await fetch(
        `/api/admin/issued-certificates/${registrationId}?${params.toString()}`
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to open certificate")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (download) {
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `certificate-${registrationId}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
      } else {
        window.open(url, "_blank", "noopener,noreferrer")
      }

      // Revoke after a short delay so the new tab can load the blob
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      console.error("Certificate PDF error:", err)
      alert(err instanceof Error ? err.message : "Failed to open certificate")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 theme-bg">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Issued Certificates</h1>
          <p className="theme-muted">
            Attendance certificates for completed course registrations
          </p>
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
          <h1 className="text-4xl font-bold theme-text mb-2">Issued Certificates</h1>
          <p className="theme-muted">
            Attendance certificates for completed course registrations
          </p>
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

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCourse)

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Issued Certificates</h1>
          <p className="theme-muted">
            Attendance certificates for completed course registrations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm theme-muted">
            <Award size={16} className="theme-primary" />
            <span>
              {filtered.length} certificate{filtered.length === 1 ? "" : "s"}
              {hasActiveFilters ? " matching" : ""}
            </span>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <span className="text-sm theme-muted">{selectedIds.size} selected</span>
              )}
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                Export Excel
                {selectedIds.size > 0 ? ` (${selectedIds.size})` : " (All)"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted"
          />
          <input
            type="text"
            placeholder="Search by name, course, certificate number, or schedule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all h-11"
          />
        </div>

        <div className="w-full sm:w-[280px] shrink-0">
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
                className="w-full justify-between bg-input border-border theme-text h-11 font-normal"
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
      </div>

      <div className="theme-card rounded-xl overflow-hidden shadow-lg overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-4 w-12">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  aria-label="Select all certificates"
                  className="border-2 border-slate-400 data-[state=checked]:border-primary"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">
                Course Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">
                Certificate Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Schedule</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center theme-muted">
                  {certificates.length === 0
                    ? "No issued certificates yet. Certificates appear when a registration is completed and the course schedule has ended."
                    : "No certificates match your filters"}
                </td>
              </tr>
            ) : (
              filtered.map((cert) => {
                const isBusy = busyId === cert.registrationId
                return (
                  <tr
                    key={cert.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedIds.has(cert.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(cert.id, checked === true)
                        }
                        aria-label={`Select ${cert.name}`}
                        className="border-2 border-slate-400 data-[state=checked]:border-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="theme-text font-medium">{cert.name}</div>
                      <div className="text-xs theme-muted mt-0.5">{cert.email}</div>
                    </td>
                    <td className="px-6 py-4 theme-text">{cert.courseName}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm theme-text">
                        {cert.certificateNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 theme-muted text-sm">{cert.schedule}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPdf(cert.registrationId, false)}
                          disabled={isBusy}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary disabled:opacity-50"
                          title="View"
                        >
                          {isBusy ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => openPdf(cert.registrationId, true)}
                          disabled={isBusy}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary disabled:opacity-50"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
