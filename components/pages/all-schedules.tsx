"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Eye, X, Calendar, Filter, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import * as XLSX from "xlsx"

interface AllSchedulesProps {
  onAddSchedule?: () => void
  onEditSchedule?: (id: string) => void
}

interface Schedule {
  id: string
  program: string
  startDate: string
  endDate: string | null
  venue: string
  fee: string | null
  status: string
  isExpired: boolean
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

export default function AllSchedules({ onAddSchedule, onEditSchedule }: AllSchedulesProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  
  // Preview states
  const [previewSchedule, setPreviewSchedule] = useState<ScheduleDetails | null>(null)
  const [showSchedulePreview, setShowSchedulePreview] = useState(false)
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)
  
  // Selection states for export
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

  // Fetch all schedules (both active and expired)
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/schedules')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch schedules')
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const transformedSchedules = result.data.map((schedule: any) => {
          let feeDisplay = 'N/A'
          if (schedule.fee) {
            feeDisplay = `$${schedule.fee.toLocaleString()}`
          }

          const formatDate = (dateString: string) => {
            const date = new Date(dateString)
            return date.toISOString().split('T')[0]
          }

          const startDate = new Date(schedule.startDate)
          startDate.setHours(0, 0, 0, 0)
          const isExpired = startDate < today

          return {
            id: schedule.id,
            program: schedule.programName || schedule.program?.programName || 'N/A',
            startDate: formatDate(schedule.startDate),
            endDate: schedule.endDate ? formatDate(schedule.endDate) : null,
            venue: schedule.venue,
            fee: feeDisplay,
            status: schedule.status,
            isExpired,
          }
        })

        setSchedules(transformedSchedules)
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setError(err instanceof Error ? err.message : 'Failed to load schedules')
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [])

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
      const response = await fetch(`/api/admin/schedules?id=${itemToDelete.id}`, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        // Refresh the list
        const response = await fetch('/api/admin/schedules')
        const result = await response.json()
        if (result.success) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const transformedSchedules = result.data.map((schedule: any) => {
            let feeDisplay = 'N/A'
            if (schedule.fee) {
              feeDisplay = `$${schedule.fee.toLocaleString()}`
            }

            const formatDate = (dateString: string) => {
              const date = new Date(dateString)
              return date.toISOString().split('T')[0]
            }

            const startDate = new Date(schedule.startDate)
            startDate.setHours(0, 0, 0, 0)
            const isExpired = startDate < today

            return {
              id: schedule.id,
              program: schedule.programName || schedule.program?.programName || 'N/A',
              startDate: formatDate(schedule.startDate),
              endDate: schedule.endDate ? formatDate(schedule.endDate) : null,
              venue: schedule.venue,
              fee: feeDisplay,
              status: schedule.status,
              isExpired,
            }
          })
          setSchedules(transformedSchedules)
        }
      }
    } catch (err) {
      console.error('Error deleting schedule:', err)
      alert('Failed to delete schedule. Please try again.')
    } finally {
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Handle edit
  const handleEdit = (id: string) => {
    if (onEditSchedule) {
      onEditSchedule(id)
    }
  }

  // Selection handlers
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

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')

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

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const handleExportSchedules = (exportFormat: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedSchedules)
    const dataToExport = selectedIds.length > 0
      ? filteredSchedules.filter(s => selectedIds.includes(s.id))
      : filteredSchedules

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(schedule => ({
      'Status': schedule.isExpired ? 'Expired' : 'Active',
      'Course': schedule.program,
      'Start Date': schedule.startDate,
      'End Date': schedule.endDate || 'N/A',
      'Venue': schedule.venue,
      'Fee': schedule.fee,
      'Program Status': schedule.status,
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `all_schedules_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
    if (exportFormat === 'csv') {
      exportToCSV(exportData, filename)
    } else {
      exportToExcel(exportData, filename)
    }
  }

  // Filter schedules based on filter, search, month, and year
  const filteredSchedules = schedules.filter((schedule) => {
    // Filter by active/expired
    if (filter === 'active' && schedule.isExpired) return false
    if (filter === 'expired' && !schedule.isExpired) return false

    // Filter by month
    if (selectedMonth !== 'all') {
      const scheduleDate = new Date(schedule.startDate)
      const scheduleMonth = (scheduleDate.getMonth() + 1).toString().padStart(2, '0')
      if (scheduleMonth !== selectedMonth) return false
    }

    // Filter by year
    if (selectedYear !== 'all') {
      const scheduleDate = new Date(schedule.startDate)
      const scheduleYear = scheduleDate.getFullYear().toString()
      if (scheduleYear !== selectedYear) return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        schedule.program.toLowerCase().includes(searchLower) ||
        schedule.venue.toLowerCase().includes(searchLower) ||
        schedule.startDate.includes(searchTerm)
      )
    }

    return true
  })

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">All Schedules</h1>
          <p className="theme-muted">View and manage all schedules including active and expired</p>
        </div>
        <div className="flex items-center gap-3">
          {filteredSchedules.length > 0 && (
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
            onClick={onAddSchedule}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
          >
            <Plus size={20} />
            Add New Schedule
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search schedules by program, venue, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-input theme-text hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-input theme-text hover:bg-muted'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-input theme-text hover:bg-muted'
              }`}
            >
              Expired
            </button>
          </div>

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
          {(selectedMonth !== 'all' || selectedYear !== 'all' || filter !== 'all' || searchTerm) && (
            <Button
              onClick={() => {
                setFilter('all')
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading schedules...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
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

      {/* Schedules Table */}
      {!loading && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center">
              <p className="theme-muted mb-4">No schedules found matching your criteria.</p>
              <button 
                onClick={onAddSchedule}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all mx-auto"
              >
                <Plus size={20} />
                Add New Schedule
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredSchedules.length > 0 && filteredSchedules.every(s => selectedSchedules.has(s.id))}
                      onCheckedChange={(checked) => handleSelectAllSchedules(checked === true)}
                      title="Select all"
                      className="border border-gray-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">End Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Venue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Program Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr 
                    key={schedule.id} 
                    className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                      schedule.isExpired ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleSchedulePreview(schedule.id)}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSchedules.has(schedule.id)}
                        onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked === true)}
                        className="border border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          schedule.isExpired
                            ? 'bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400'
                            : 'bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400'
                        }
                      >
                        {schedule.isExpired ? 'Expired' : 'Active'}
                      </Badge>
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
                          onClick={() => handleEdit(schedule.id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setItemToDelete({ id: schedule.id, name: schedule.program })
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
          )}
        </div>
      )}

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
              This action cannot be undone. This will permanently delete the schedule "{itemToDelete?.name}".
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

