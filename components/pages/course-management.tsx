"use client"

import { useState, useEffect, useMemo } from "react"
import React from "react"
import { Plus, Edit2, Trash2, Search, Eye, X, Calendar, Filter, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import * as XLSX from "xlsx"

interface CourseManagementProps {
  onAddProgram?: () => void
  onAddSchedule?: () => void
  onEditProgram?: (id: string) => void
  onEditSchedule?: (id: string) => void
  initialTab?: "programs" | "schedules"
}

interface Program {
  id: string
  refCode: string
  name: string
  category: string
  type: string
  status: string
  duration: string
}

interface Schedule {
  id: string
  program: string
  startDate: string
  endDate: string | null
  venue: string
  fee: string | null
  status: string
}

interface ProgramDetails {
  id: string
  refCode: string
  programName: string
  category: string
  type: string[]
  status: string
  duration: string
  targetAudience?: string
  learningObjectives?: string
  trainingMethodology?: string
  introduction?: string
  description?: string
  organisationalImpact?: string
  personalImpact?: string
  whoShouldAttend?: string
  mainCourseImageUrl?: string
  cardImageUrl?: string
  courseOutline?: Array<{ day: string; title: string; content: string }>
  certifications?: Array<{ name: string; description?: string; imageUrl?: string }>
  faqs?: Array<{ question: string; answer: string }>
}

interface ScheduleDetails {
  id: string
  programId: string
  programName: string
  mentorId?: string
  mentor?: { name: string; email: string }
  startDate: string
  endDate?: string
  venue: string
  fee?: number
  status: string
  city?: string
  country?: string
}

export default function CourseManagement({ onAddProgram, onAddSchedule, onEditProgram, onEditSchedule, initialTab = "programs" }: CourseManagementProps) {
  const [activeTab, setActiveTab] = useState<"programs" | "schedules">(initialTab)
  const [programs, setPrograms] = useState<Program[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  
  // Preview states
  const [previewProgram, setPreviewProgram] = useState<ProgramDetails | null>(null)
  const [previewSchedule, setPreviewSchedule] = useState<ScheduleDetails | null>(null)
  const [showProgramPreview, setShowProgramPreview] = useState(false)
  const [showSchedulePreview, setShowSchedulePreview] = useState(false)
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null)
  
  // Store all program details for instant access
  const [programDetailsMap, setProgramDetailsMap] = useState<Map<string, ProgramDetails>>(new Map())
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'program' | 'schedule'; name: string } | null>(null)
  
  // Selection states for export
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(new Set())
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set())

  // Get unique months and years from schedules
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    schedules.forEach((schedule) => {
      const date = new Date(schedule.startDate)
      const month = date.getMonth() + 1 // 1-12
      months.add(month.toString().padStart(2, '0'))
    })
    return Array.from(months).sort()
  }, [schedules])

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    schedules.forEach((schedule) => {
      const date = new Date(schedule.startDate)
      const year = date.getFullYear()
      years.add(year.toString())
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)) // Descending order
  }, [schedules])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Sync activeTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Clear search and filters when switching tabs
  useEffect(() => {
    setSearchTerm("")
    setSelectedMonth('all')
    setSelectedYear('all')
    // Clear selections when switching tabs
    setSelectedPrograms(new Set())
    setSelectedSchedules(new Set())
  }, [activeTab])

  // Fetch programs from database with all details upfront for instant preview
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true)
        // Fetch with details to preload all data for instant preview
        const response = await fetch('/api/admin/programs?includeDetails=true')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch programs')
        }

        // Transform programs for table display
        const transformedPrograms = result.data.map((program: any) => ({
          id: program.id,
          refCode: program.refCode,
          name: program.programName,
          category: program.category,
          type: Array.isArray(program.type) ? program.type.join(', ') : program.type || 'N/A',
          status: program.status,
          duration: program.duration,
        }))

        setPrograms(transformedPrograms)

        // Preload all program details into a Map for instant access
        const detailsMap = new Map<string, ProgramDetails>()
        result.data.forEach((program: any) => {
          detailsMap.set(program.id, {
            id: program.id,
            refCode: program.refCode,
            programName: program.programName,
            category: program.category,
            type: program.type || [],
            status: program.status,
            duration: program.duration,
            targetAudience: program.targetAudience,
            learningObjectives: program.learningObjectives,
            trainingMethodology: program.trainingMethodology,
            introduction: program.introduction,
            description: program.description,
            organisationalImpact: program.organisationalImpact,
            personalImpact: program.personalImpact,
            whoShouldAttend: program.whoShouldAttend,
            mainCourseImageUrl: program.mainCourseImageUrl,
            cardImageUrl: program.cardImageUrl,
            courseOutline: program.courseOutline || [],
            certifications: program.certifications || [],
            faqs: program.faqs || [],
          })
        })
        setProgramDetailsMap(detailsMap)
      } catch (err) {
        console.error('Error fetching programs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programs')
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  // Fetch schedules from database - only active (non-expired) schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true)
        const response = await fetch('/api/admin/schedules')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch schedules')
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const transformedSchedules = result.data
          .map((schedule: any) => {
            let feeDisplay = 'N/A'
            if (schedule.fee) {
              feeDisplay = `$${schedule.fee.toLocaleString()}`
            }

            const formatDate = (dateString: string) => {
              const date = new Date(dateString)
              return date.toISOString().split('T')[0]
            }

            return {
              id: schedule.id,
              program: schedule.programName || schedule.program?.programName || 'N/A',
              startDate: formatDate(schedule.startDate),
              endDate: schedule.endDate ? formatDate(schedule.endDate) : null,
              venue: schedule.venue,
              fee: feeDisplay,
              status: schedule.status,
              startDateObj: new Date(schedule.startDate),
            }
          })
          // Filter out expired schedules - only show active (non-expired) ones
          .filter((schedule: any) => {
            const startDate = new Date(schedule.startDateObj)
            startDate.setHours(0, 0, 0, 0)
            return startDate >= today
          })
          .map(({ startDateObj, ...rest }: any) => rest) // Remove temporary startDateObj

        setSchedules(transformedSchedules)
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setScheduleError(err instanceof Error ? err.message : 'Failed to load schedules')
        setSchedules([])
      } finally {
        setLoadingSchedules(false)
      }
    }

    fetchSchedules()
  }, [])

  // Handle program preview - toggle inline expansion (instant, no API call)
  const handleProgramPreview = (programId: string) => {
    // If already expanded, collapse it
    if (expandedProgramId === programId) {
      setExpandedProgramId(null)
      setPreviewProgram(null)
      return
    }

    // Get program details from preloaded map (instant access, no API call)
    const programDetails = programDetailsMap.get(programId)
    if (programDetails) {
      setPreviewProgram(programDetails)
      setExpandedProgramId(programId)
    }
  }

  // Handle schedule preview
  const handleSchedulePreview = async (scheduleId: string) => {
    try {
      const response = await fetch('/api/admin/schedules')
      const result = await response.json()
      
      if (result.success) {
        const schedule = result.data.find((s: any) => s.id === scheduleId)
        if (schedule) {
          setPreviewSchedule({
            id: schedule.id,
            programId: schedule.programId,
            programName: schedule.programName || schedule.program?.programName || 'N/A',
            mentorId: schedule.mentorId,
            mentor: schedule.mentor,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            venue: schedule.venue,
            fee: schedule.fee,
            status: schedule.status,
            city: schedule.city,
            country: schedule.country,
          })
          setShowSchedulePreview(true)
        }
      }
    } catch (err) {
      console.error('Error fetching schedule details:', err)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      const endpoint = itemToDelete.type === 'program' 
        ? `/api/admin/programs?id=${itemToDelete.id}`
        : `/api/admin/schedules?id=${itemToDelete.id}`
      
      const response = await fetch(endpoint, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        // Refresh the list
        if (itemToDelete.type === 'program') {
          const response = await fetch('/api/admin/programs?includeDetails=true')
          const result = await response.json()
          if (result.success) {
            const transformedPrograms = result.data.map((program: any) => ({
              id: program.id,
              refCode: program.refCode,
              name: program.programName,
              category: program.category,
              type: Array.isArray(program.type) ? program.type.join(', ') : program.type || 'N/A',
              status: program.status,
              duration: program.duration,
            }))
            setPrograms(transformedPrograms)

            // Update program details map
            const detailsMap = new Map<string, ProgramDetails>()
            result.data.forEach((program: any) => {
              detailsMap.set(program.id, {
                id: program.id,
                refCode: program.refCode,
                programName: program.programName,
                category: program.category,
                type: program.type || [],
                status: program.status,
                duration: program.duration,
                targetAudience: program.targetAudience,
                learningObjectives: program.learningObjectives,
                trainingMethodology: program.trainingMethodology,
                introduction: program.introduction,
                description: program.description,
                organisationalImpact: program.organisationalImpact,
                personalImpact: program.personalImpact,
                whoShouldAttend: program.whoShouldAttend,
                mainCourseImageUrl: program.mainCourseImageUrl,
                cardImageUrl: program.cardImageUrl,
                courseOutline: program.courseOutline || [],
                certifications: program.certifications || [],
                faqs: program.faqs || [],
              })
            })
            setProgramDetailsMap(detailsMap)
          }
        } else {
          const response = await fetch('/api/admin/schedules')
          const result = await response.json()
          if (result.success) {
            const transformedSchedules = result.data.map((schedule: any) => {
              let feeDisplay = 'N/A'
              if (schedule.fee) {
                feeDisplay = `$${schedule.fee.toLocaleString()}`
              }
              const formatDate = (dateString: string) => {
                const date = new Date(dateString)
                return date.toISOString().split('T')[0]
              }
              return {
                id: schedule.id,
                program: schedule.programName || schedule.program?.programName || 'N/A',
                startDate: formatDate(schedule.startDate),
                endDate: schedule.endDate ? formatDate(schedule.endDate) : null,
                venue: schedule.venue,
                fee: feeDisplay,
                status: schedule.status,
              }
            })
            setSchedules(transformedSchedules)
          }
        }
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item. Please try again.')
    } finally {
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Handle edit - navigate to edit page
  const handleEdit = (id: string, type: 'program' | 'schedule') => {
    if (type === 'program' && onEditProgram) {
      onEditProgram(id)
    } else if (type === 'schedule' && onEditSchedule) {
      onEditSchedule(id)
    }
  }

  // Selection handlers
  const handleSelectProgram = (programId: string, checked: boolean) => {
    setSelectedPrograms(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(programId)
      } else {
        newSet.delete(programId)
      }
      return newSet
    })
  }

  const handleSelectSchedule = (scheduleId: string, checked: boolean) => {
    setSelectedSchedules(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(scheduleId)
      } else {
        newSet.delete(scheduleId)
      }
      return newSet
    })
  }

  const handleSelectAllPrograms = (checked: boolean) => {
    if (checked) {
      setSelectedPrograms(new Set(filteredPrograms.map(p => p.id)))
    } else {
      setSelectedPrograms(new Set())
    }
  }

  const handleSelectAllSchedules = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(new Set(filteredSchedules.map(s => s.id)))
    } else {
      setSelectedSchedules(new Set())
    }
  }

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data selected to export')
      return
    }

    // Get headers from the first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that might contain commas, quotes, or newlines
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')

    // Create blob and download
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

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const handleExportPrograms = (format: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedPrograms)
    
    // If items are selected, export only selected items
    // If nothing is selected, export all filtered items
    const dataToExport = selectedIds.length > 0
      ? filteredPrograms.filter(p => selectedIds.includes(p.id))
      : filteredPrograms

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(program => ({
      'Ref Code': program.refCode,
      'Course Name': program.name,
      'Category': program.category,
      'Type': program.type,
      'Duration': program.duration,
      'Status': program.status,
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `courses_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
    if (format === 'csv') {
      exportToCSV(exportData, filename)
    } else {
      exportToExcel(exportData, filename)
    }
  }

  const handleExportSchedules = (format: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedSchedules)
    
    // If items are selected, export only selected items
    // If nothing is selected, export all filtered items
    const dataToExport = selectedIds.length > 0
      ? filteredSchedules.filter(s => selectedIds.includes(s.id))
      : filteredSchedules

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(schedule => ({
      'Course': schedule.program,
      'Start Date': schedule.startDate,
      'End Date': schedule.endDate || 'N/A',
      'Venue': schedule.venue,
      'Fee': schedule.fee,
      'Status': schedule.status,
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `schedules_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
    if (format === 'csv') {
      exportToCSV(exportData, filename)
    } else {
      exportToExcel(exportData, filename)
    }
  }

  // Filter programs based on search term (reference code, name, category)
  const filteredPrograms = useMemo(() => {
    if (!searchTerm.trim()) {
      return programs
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return programs.filter((program) => {
      const refCodeMatch = program.refCode?.toLowerCase().includes(searchLower) || false
      const nameMatch = program.name?.toLowerCase().includes(searchLower) || false
      const categoryMatch = program.category?.toLowerCase().includes(searchLower) || false
      
      return refCodeMatch || nameMatch || categoryMatch
    })
  }, [programs, searchTerm])

  // Filter schedules based on search term, month, and year
  const filteredSchedules = useMemo(() => {
    let filtered = schedules

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter((schedule) => {
        const scheduleDate = new Date(schedule.startDate)
        const scheduleMonth = (scheduleDate.getMonth() + 1).toString().padStart(2, '0')
        return scheduleMonth === selectedMonth
      })
    }

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter((schedule) => {
        const scheduleDate = new Date(schedule.startDate)
        const scheduleYear = scheduleDate.getFullYear().toString()
        return scheduleYear === selectedYear
      })
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((schedule) => {
        const programMatch = schedule.program?.toLowerCase().includes(searchLower) || false
        const venueMatch = schedule.venue?.toLowerCase().includes(searchLower) || false
        
        return programMatch || venueMatch
      })
    }

    return filtered
  }, [schedules, searchTerm, selectedMonth, selectedYear])

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Course Management</h1>
          <p className="theme-muted">Manage all training courses and schedule programs</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          {activeTab === "programs" && filteredPrograms.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedPrograms.size > 0 && (
                <span className="text-sm theme-muted">
                  {selectedPrograms.size} selected
                </span>
              )}
              <Button
                onClick={() => handleExportPrograms('csv')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV {selectedPrograms.size > 0 && `(${selectedPrograms.size})`}
              </Button>
              <Button
                onClick={() => handleExportPrograms('excel')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Excel {selectedPrograms.size > 0 && `(${selectedPrograms.size})`}
              </Button>
            </div>
          )}
          {activeTab === "schedules" && filteredSchedules.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedSchedules.size > 0 && (
                <span className="text-sm theme-muted">
                  {selectedSchedules.size} selected
                </span>
              )}
              <Button
                onClick={() => handleExportSchedules('csv')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV {selectedSchedules.size > 0 && `(${selectedSchedules.size})`}
              </Button>
              <Button
                onClick={() => handleExportSchedules('excel')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Excel {selectedSchedules.size > 0 && `(${selectedSchedules.size})`}
              </Button>
            </div>
          )}
          <button 
            onClick={activeTab === "programs" ? onAddProgram : onAddSchedule}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
          >
            <Plus size={20} />
            {activeTab === "programs" ? "Add New Course" : "Add New Schedule"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("programs")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "programs"
              ? "theme-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "schedules"
              ? "theme-primary border-b-2 border-primary"
              : "theme-muted hover:theme-text"
          }`}
        >
          Schedule/Manage Programs
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === "programs" ? "Search by reference code, name, or category..." : "Search by program name or venue..."}
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

        {/* Month and Year Filters - Only show for schedules tab */}
        {activeTab === "schedules" && (
          <div className="flex flex-wrap gap-4 items-center">
            {/* Month Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="theme-muted" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {monthNames[parseInt(month) - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="theme-muted" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(selectedMonth !== 'all' || selectedYear !== 'all' || searchTerm) && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedMonth('all')
                  setSelectedYear('all')
                }}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <X size={16} className="mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && activeTab === "programs" && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading programs...</p>
        </div>
      )}

      {/* Error State */}
      {error && activeTab === "programs" && (
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

      {/* Courses Table */}
      {!loading && !error && activeTab === "programs" && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredPrograms.length === 0 ? (
            <div className="p-8 text-center">
              {programs.length === 0 ? (
                <>
                  <p className="theme-muted mb-4">No programs found. Create your first program!</p>
                  <button 
                    onClick={onAddProgram}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all mx-auto"
                  >
                    <Plus size={20} />
                    Add New Course
                  </button>
                </>
              ) : (
                <p className="theme-muted mb-4">No programs found matching "{searchTerm}". Try a different search term.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredPrograms.length > 0 && filteredPrograms.every(p => selectedPrograms.has(p.id))}
                      onCheckedChange={(checked) => handleSelectAllPrograms(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      title="Select all"
                      className="border border-gray-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Ref Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <React.Fragment key={program.id}>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleProgramPreview(program.id)}>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedPrograms.has(program.id)}
                          onCheckedChange={(checked) => handleSelectProgram(program.id, checked === true)}
                          onClick={(e) => e.stopPropagation()}
                          className="border border-gray-500"
                        />
                      </td>
                      <td className="px-6 py-4 theme-primary font-medium">{program.refCode}</td>
                      <td className="px-6 py-4 theme-text font-medium">{program.name}</td>
                      <td className="px-6 py-4 theme-muted">{program.category}</td>
                      <td className="px-6 py-4 theme-muted">{program.type}</td>
                      <td className="px-6 py-4 theme-muted">{program.duration}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            program.status === "Published"
                              ? "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {program.status}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleProgramPreview(program.id)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                            title={expandedProgramId === program.id ? "Hide Details" : "Show Details"}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(program.id, 'program')}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setItemToDelete({ id: program.id, type: 'program', name: program.name })
                              setDeleteConfirmOpen(true)
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedProgramId === program.id && previewProgram && (
                      <tr className="border-b border-border bg-muted/20">
                        <td colSpan={8} className="px-6 py-6">
                          <div className="space-y-6">
                            {/* Header with close button */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge variant="secondary">{previewProgram.refCode}</Badge>
                                <Badge>{previewProgram.category}</Badge>
                                <Badge>{previewProgram.status}</Badge>
                              </div>
                              <button
                                onClick={() => {
                                  setExpandedProgramId(null)
                                  setPreviewProgram(null)
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title="Close"
                              >
                                <X size={18} />
                              </button>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Duration</h3>
                                <p className="theme-muted">{previewProgram.duration}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Type</h3>
                                <p className="theme-muted">{previewProgram.type.join(', ')}</p>
                              </div>
                            </div>

                            {/* Description */}
                            {previewProgram.description && (
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Description</h3>
                                <div className="theme-muted prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewProgram.description }} />
                              </div>
                            )}

                            {/* Introduction */}
                            {previewProgram.introduction && (
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Introduction</h3>
                                <div className="theme-muted prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewProgram.introduction }} />
                              </div>
                            )}

                            {/* Course Outline */}
                            {previewProgram.courseOutline && previewProgram.courseOutline.length > 0 && (
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Course Outline</h3>
                                <div className="space-y-3">
                                  {previewProgram.courseOutline.map((item, index) => (
                                    <div key={index} className="border-l-4 border-primary pl-4">
                                      <h4 className="font-medium theme-text text-sm">{item.day}: {item.title}</h4>
                                      <div className="theme-muted mt-1 prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: item.content }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Certifications */}
                            {previewProgram.certifications && previewProgram.certifications.length > 0 && (
                              <div>
                                <h3 className="font-semibold theme-text mb-2">Certifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  {previewProgram.certifications.map((cert, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <h4 className="font-medium theme-text text-sm">{cert.name}</h4>
                                      {cert.description && <p className="theme-muted text-xs mt-1">{cert.description}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* FAQs */}
                            {previewProgram.faqs && previewProgram.faqs.length > 0 && (
                              <div>
                                <h3 className="font-semibold theme-text mb-2">FAQs</h3>
                                <div className="space-y-2">
                                  {previewProgram.faqs.map((faq, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <h4 className="font-medium theme-text mb-2 text-sm">{faq.question}</h4>
                                      <p className="theme-muted text-xs">{faq.answer}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Loading State for Schedules */}
      {loadingSchedules && activeTab === "schedules" && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading schedules...</p>
        </div>
      )}

      {/* Error State for Schedules */}
      {scheduleError && !loadingSchedules && activeTab === "schedules" && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="text-destructive">Error: {scheduleError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Schedules Table */}
      {!loadingSchedules && !scheduleError && activeTab === "schedules" && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center">
              {schedules.length === 0 ? (
                <>
                  <p className="theme-muted mb-4">No active schedules found. Create your first schedule!</p>
                  <button 
                    onClick={onAddSchedule}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all mx-auto"
                  >
                    <Plus size={20} />
                    Add New Schedule
                  </button>
                </>
              ) : (
                <p className="theme-muted mb-4">No schedules found matching "{searchTerm}". Try a different search term.</p>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border bg-muted/30">
                <p className="text-sm theme-muted">
                  Showing only active (non-expired) schedules. 
                  <span className="ml-2 theme-text font-medium">Note: Only schedules with start dates today or in the future are displayed here.</span>
                </p>
              </div>
              <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredSchedules.length > 0 && filteredSchedules.every(s => selectedSchedules.has(s.id))}
                      onCheckedChange={(checked) => handleSelectAllSchedules(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      className="border border-gray-500"
                      title="Select all"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">End Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Venue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleSchedulePreview(schedule.id)}>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSchedules.has(schedule.id)}
                        onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked === true)}
                        onClick={(e) => e.stopPropagation()}
                        className="border border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4 theme-text font-medium">{schedule.program}</td>
                    <td className="px-6 py-4 theme-muted">{schedule.startDate}</td>
                    <td className="px-6 py-4 theme-muted">{schedule.endDate || 'N/A'}</td>
                    <td className="px-6 py-4 theme-muted">{schedule.venue}</td>
                    <td className="px-6 py-4 theme-accent font-medium">{schedule.fee}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          schedule.status === "Open"
                            ? "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
                            : schedule.status === "Closed" || schedule.status === "Cancelled"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-400/20 dark:text-yellow-400"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSchedulePreview(schedule.id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(schedule.id, 'schedule')}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setItemToDelete({ id: schedule.id, type: 'schedule', name: schedule.program })
                            setDeleteConfirmOpen(true)
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      )}

      {/* Program Preview Dialog */}
      <Dialog open={showProgramPreview} onOpenChange={setShowProgramPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewProgram?.programName}</DialogTitle>
            <DialogDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{previewProgram?.refCode}</Badge>
                <Badge>{previewProgram?.category}</Badge>
                <Badge>{previewProgram?.status}</Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          {previewProgram && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold theme-text mb-2">Duration</h3>
                  <p className="theme-muted">{previewProgram.duration}</p>
                </div>
                <div>
                  <h3 className="font-semibold theme-text mb-2">Type</h3>
                  <p className="theme-muted">{previewProgram.type.join(', ')}</p>
                </div>
              </div>

              {/* Description */}
              {previewProgram.description && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Description</h3>
                  <div className="theme-muted prose max-w-none" dangerouslySetInnerHTML={{ __html: previewProgram.description }} />
                </div>
              )}

              {/* Introduction */}
              {previewProgram.introduction && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Introduction</h3>
                  <div className="theme-muted prose max-w-none" dangerouslySetInnerHTML={{ __html: previewProgram.introduction }} />
                </div>
              )}

              {/* Course Outline */}
              {previewProgram.courseOutline && previewProgram.courseOutline.length > 0 && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Course Outline</h3>
                  <div className="space-y-4">
                    {previewProgram.courseOutline.map((item, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium theme-text">{item.day}: {item.title}</h4>
                        <div className="theme-muted mt-1 prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {previewProgram.certifications && previewProgram.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Certifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {previewProgram.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium theme-text">{cert.name}</h4>
                        {cert.description && <p className="theme-muted text-sm mt-1">{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {previewProgram.faqs && previewProgram.faqs.length > 0 && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">FAQs</h3>
                  <div className="space-y-3">
                    {previewProgram.faqs.map((faq, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium theme-text mb-2">{faq.question}</h4>
                        <p className="theme-muted text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Preview Dialog */}
      <Dialog open={showSchedulePreview} onOpenChange={setShowSchedulePreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewSchedule?.programName}</DialogTitle>
            <DialogDescription>
              <Badge className="mt-2">{previewSchedule?.status}</Badge>
            </DialogDescription>
          </DialogHeader>
          
          {previewSchedule && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold theme-text mb-2">Start Date</h3>
                  <p className="theme-muted">{previewSchedule.startDate ? format(new Date(previewSchedule.startDate), 'PPP') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold theme-text mb-2">End Date</h3>
                  <p className="theme-muted">{previewSchedule.endDate ? format(new Date(previewSchedule.endDate), 'PPP') : 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold theme-text mb-2">Venue</h3>
                  <p className="theme-muted">{previewSchedule.venue}</p>
                </div>
                <div>
                  <h3 className="font-semibold theme-text mb-2">Fee</h3>
                  <p className="theme-accent font-medium">{previewSchedule.fee ? `$${previewSchedule.fee.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>

              {previewSchedule.city && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold theme-text mb-2">City</h3>
                    <p className="theme-muted">{previewSchedule.city}</p>
                  </div>
                  {previewSchedule.country && (
                    <div>
                      <h3 className="font-semibold theme-text mb-2">Country</h3>
                      <p className="theme-muted">{previewSchedule.country}</p>
                    </div>
                  )}
                </div>
              )}

              {previewSchedule.mentor && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Mentor</h3>
                  <p className="theme-muted">{previewSchedule.mentor.name} ({previewSchedule.mentor.email})</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {itemToDelete?.type === 'program' ? 'the course' : 'the schedule'} "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}