"use client"

import { useState, useEffect, useMemo } from "react"
import React from "react"
import { Plus, Edit2, Trash2, Search, Eye, X, Calendar, Filter, Download, Upload, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
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
  
  // Pagination states for schedules
  const [schedulePage, setSchedulePage] = useState(1)
  const [scheduleTotalPages, setScheduleTotalPages] = useState(1)
  const [scheduleTotal, setScheduleTotal] = useState(0)
  const [allScheduleMonths, setAllScheduleMonths] = useState<string[]>([])
  const [allScheduleYears, setAllScheduleYears] = useState<string[]>([])
  
  // Pagination states for programs
  const [programPage, setProgramPage] = useState(1)
  const [programTotalPages, setProgramTotalPages] = useState(1)
  const [programTotal, setProgramTotal] = useState(0)
  
  // Preview states
  const [previewProgram, setPreviewProgram] = useState<ProgramDetails | null>(null)
  const [previewSchedule, setPreviewSchedule] = useState<ScheduleDetails | null>(null)
  const [showProgramPreview, setShowProgramPreview] = useState(false)
  const [showSchedulePreview, setShowSchedulePreview] = useState(false)
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null)
  
  // Bulk import states
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    total: number
    successful: number
    failed: number
    success: Array<{ row: number; refCode: string; programName: string }>
    errors: Array<{ row: number; error: string; data: any }>
  } | null>(null)
  
  // Store all program details for instant access
  const [programDetailsMap, setProgramDetailsMap] = useState<Map<string, ProgramDetails>>(new Map())
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'program' | 'schedule'; name: string } | null>(null)
  
  // Selection states for export
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(new Set())
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set())

  // Use allScheduleMonths and allScheduleYears for filters (populated from all schedules)
  const availableMonths = useMemo(() => {
    return allScheduleMonths.sort()
  }, [allScheduleMonths])

  const availableYears = useMemo(() => {
    return allScheduleYears.sort((a, b) => parseInt(b) - parseInt(a)) // Descending order
  }, [allScheduleYears])

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
    setSchedulePage(1) // Reset to first page when switching tabs
    setProgramPage(1) // Reset to first page when switching tabs
    // Clear selections when switching tabs
    setSelectedPrograms(new Set())
    setSelectedSchedules(new Set())
  }, [activeTab])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    if (activeTab === 'schedules') {
      setSchedulePage(1)
    } else if (activeTab === 'programs') {
      setProgramPage(1)
    }
  }, [selectedMonth, selectedYear, searchTerm, activeTab])

  // Fetch programs from database with pagination and search
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true)
        
        // Build query params
        const params = new URLSearchParams()
        params.append('page', programPage.toString())
        params.append('limit', '50')
        params.append('includeDetails', 'true') // Include details for preview
        
        // Add search filter if provided
        if (searchTerm.trim() && activeTab === 'programs') {
          params.append('search', searchTerm.trim())
        }
        
        const response = await fetch(`/api/admin/programs?${params.toString()}`)
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

        // Preload program details into a Map for instant access
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
        
        // Update pagination info
        if (result.pagination) {
          setProgramTotalPages(result.pagination.totalPages || 1)
          setProgramTotal(result.pagination.total || 0)
        }
      } catch (err) {
        console.error('Error fetching programs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programs')
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'programs') {
      fetchPrograms()
    }
  }, [programPage, searchTerm, activeTab])

  // Fetch all unique months and years from all schedules (for filter dropdowns)
  useEffect(() => {
    const fetchAllScheduleMetadata = async () => {
      try {
        // Fetch first page with large limit to get all unique months/years
        // Or we can fetch all schedules metadata separately
        const response = await fetch('/api/admin/schedules?page=1&limit=10000')
        const result = await response.json()
        
        if (result.success && result.data) {
          const months = new Set<string>()
          const years = new Set<string>()
          
          result.data.forEach((schedule: any) => {
            const date = new Date(schedule.startDate)
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear().toString()
            months.add(month)
            years.add(year)
          })
          
          setAllScheduleMonths(Array.from(months))
          setAllScheduleYears(Array.from(years))
        }
      } catch (err) {
        console.error('Error fetching schedule metadata:', err)
      }
    }

    fetchAllScheduleMetadata()
  }, [])

  // Fetch schedules from database with pagination and filters
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true)
        
        // Build query params
        const params = new URLSearchParams()
        params.append('page', schedulePage.toString())
        params.append('limit', '50')
        
        // Add month and year filters if selected
        if (selectedMonth !== 'all') {
          params.append('month', selectedMonth)
        }
        if (selectedYear !== 'all') {
          params.append('year', selectedYear)
        }
        
        const response = await fetch(`/api/admin/schedules?${params.toString()}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch schedules')
        }

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
            }
          })

        setSchedules(transformedSchedules)
        
        // Update pagination info
        if (result.pagination) {
          setScheduleTotalPages(result.pagination.totalPages || 1)
          setScheduleTotal(result.pagination.total || 0)
        }
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setScheduleError(err instanceof Error ? err.message : 'Failed to load schedules')
        setSchedules([])
      } finally {
        setLoadingSchedules(false)
      }
    }

    fetchSchedules()
  }, [schedulePage, selectedMonth, selectedYear])

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

  // Handle bulk import
  const handleBulkImport = async () => {
    if (!importFile) {
      alert('Please select a file first')
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/admin/programs/bulk-import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImportResults(result.results)
        // Refresh programs list after successful import
        if (result.results.successful > 0) {
          // Trigger a refresh of the programs list
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Error importing courses:', error)
      alert(`Error: ${error.message || 'Failed to import courses'}`)
    } finally {
      setImporting(false)
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

  // Programs are already filtered server-side, so use them directly
  const filteredPrograms = useMemo(() => {
    return programs
  }, [programs])

  // Filter schedules based on search term only (month/year filtering is done server-side)
  const filteredSchedules = useMemo(() => {
    let filtered = schedules

    // Filter by search term (client-side for instant feedback)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((schedule) => {
        const programMatch = schedule.program?.toLowerCase().includes(searchLower) || false
        const venueMatch = schedule.venue?.toLowerCase().includes(searchLower) || false
        
        return programMatch || venueMatch
      })
    }

    return filtered
  }, [schedules, searchTerm])

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
          {/* Pagination Controls for Programs */}
          {filteredPrograms.length > 0 && programTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm theme-muted">
                Showing page {programPage} of {programTotalPages} ({programTotal} total programs)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProgramPage(prev => Math.max(1, prev - 1))}
                  disabled={programPage === 1 || loading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, programTotalPages) }, (_, i) => {
                    let pageNum: number
                    if (programTotalPages <= 5) {
                      pageNum = i + 1
                    } else if (programPage <= 3) {
                      pageNum = i + 1
                    } else if (programPage >= programTotalPages - 2) {
                      pageNum = programTotalPages - 4 + i
                    } else {
                      pageNum = programPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={programPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProgramPage(pageNum)}
                        disabled={loading}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProgramPage(prev => Math.min(programTotalPages, prev + 1))}
                  disabled={programPage === programTotalPages || loading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
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
            {/* Pagination Controls */}
            {scheduleTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm theme-muted">
                  Showing page {schedulePage} of {scheduleTotalPages} ({scheduleTotal} total schedules)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))}
                    disabled={schedulePage === 1 || loadingSchedules}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, scheduleTotalPages) }, (_, i) => {
                      let pageNum: number
                      if (scheduleTotalPages <= 5) {
                        pageNum = i + 1
                      } else if (schedulePage <= 3) {
                        pageNum = i + 1
                      } else if (schedulePage >= scheduleTotalPages - 2) {
                        pageNum = scheduleTotalPages - 4 + i
                      } else {
                        pageNum = schedulePage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={schedulePage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSchedulePage(pageNum)}
                          disabled={loadingSchedules}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSchedulePage(prev => Math.min(scheduleTotalPages, prev + 1))}
                    disabled={schedulePage === scheduleTotalPages || loadingSchedules}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
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

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6" />
              Bulk Import Courses
            </DialogTitle>
            <DialogDescription>
              Upload an Excel file with columns: Reference Code, Category, Course Name/Title, and Date (From Date).
              The system will automatically generate course content based on the course name.
            </DialogDescription>
          </DialogHeader>

          {!importResults ? (
            <div className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 theme-muted" />
                <p className="theme-text font-medium mb-2">Upload Excel File</p>
                <p className="theme-muted text-sm mb-4">
                  Supported formats: .xlsx, .xls
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImportFile(file)
                    }
                  }}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Upload size={16} />
                  Choose File
                </label>
                {importFile && (
                  <p className="mt-4 theme-text text-sm">
                    Selected: <span className="font-medium">{importFile.name}</span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Excel File Format:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li><strong>Reference Code:</strong> Unique code for each course</li>
                  <li><strong>Category:</strong> Course category (e.g., Management, Finance, IT)</li>
                  <li><strong>Course Name/Title:</strong> Full name of the course</li>
                  <li><strong>Date/From Date:</strong> Start date (used to calculate duration)</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkImport(false)
                    setImportFile(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={!importFile || importing}
                  className="bg-primary text-primary-foreground"
                >
                  {importing ? 'Importing...' : 'Start Import'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResults.successful}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">Successful</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResults.failed}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">Failed</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {importResults.total}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="font-medium text-red-600 dark:text-red-400 mb-2">Errors:</p>
                  <div className="space-y-2">
                    {importResults.errors.map((error, idx) => (
                      <div key={idx} className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                        <p className="font-medium">Row {error.row}: {error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResults.success.length > 0 && (
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="font-medium text-green-600 dark:text-green-400 mb-2">
                    Successfully Imported:
                  </p>
                  <div className="space-y-1">
                    {importResults.success.map((item, idx) => (
                      <div key={idx} className="text-sm bg-green-50 dark:bg-green-950 p-2 rounded">
                        <span className="font-medium">{item.refCode}</span>: {item.programName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkImport(false)
                    setImportFile(null)
                    setImportResults(null)
                    // Refresh programs list
                    window.location.reload()
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setImportFile(null)
                    setImportResults(null)
                  }}
                  className="bg-primary text-primary-foreground"
                >
                  Import Another File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}