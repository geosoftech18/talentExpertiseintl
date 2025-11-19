"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Eye, X, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import * as XLSX from "xlsx"

interface Venue {
  id: string
  name: string
  city: string
  country: string
  status: "Active" | "Inactive"
  scheduleCount?: number // Number of schedules using this venue
  isFromDatabase?: boolean // Whether this venue exists in the database
}

// Function to parse venue string into city and country
function parseVenue(venueString: string): { city: string; country: string } {
  if (!venueString || !venueString.trim()) {
    return { city: 'Unknown', country: 'Unknown' }
  }

  // Handle special cases without commas
  if (venueString === 'Hong Kong' || venueString.trim() === 'Hong Kong') {
    return { city: 'Hong Kong', country: 'Hong Kong' }
  }
  if (venueString === 'Singapore' || venueString.trim() === 'Singapore') {
    return { city: 'Singapore', country: 'Singapore' }
  }
  
  // Split by comma to get city and country
  const parts = venueString.split(',').map(p => p.trim()).filter(p => p.length > 0)
  
  if (parts.length >= 2) {
    // Format: "City, Country"
    return {
      city: parts[0],
      country: parts.slice(1).join(', ') // In case there are multiple commas
    }
  }
  
  // If no comma, treat the whole string as city and country
  return { city: venueString.trim(), country: venueString.trim() }
}

export default function Venues({ onAddVenue, onEditVenue }: { onAddVenue?: () => void; onEditVenue?: (id: string) => void }) {
  const [databaseVenues, setDatabaseVenues] = useState<Venue[]>([])
  const [venuesFromSchedules, setVenuesFromSchedules] = useState<Map<string, { venue: string; city: string; country: string; count: number }>>(new Map())
  const [loadingDatabase, setLoadingDatabase] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewVenue, setPreviewVenue] = useState<Venue | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<{ id: string; name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "Active" | "Inactive">("all")
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(new Set())

  // Fetch venues from database
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingDatabase(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch venues')
        }

        setDatabaseVenues(result.data.map((v: any) => ({ 
          ...v, 
          id: String(v.id),
          isFromDatabase: true,
          scheduleCount: 0
        })))
      } catch (err) {
        console.error('Error fetching venues:', err)
        setError(err instanceof Error ? err.message : 'Failed to load venues')
        setDatabaseVenues([])
      } finally {
        setLoadingDatabase(false)
      }
    }

    fetchVenues()
  }, [])

  // Fetch all unique venues from schedules
  useEffect(() => {
    const fetchVenuesFromSchedules = async () => {
      try {
        setLoadingSchedules(true)
        const response = await fetch('/api/admin/schedules?limit=10000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch schedules')
        }

        // Extract unique venues from schedules
        const venueMap = new Map<string, { city: string; country: string; count: number }>()
        
        result.data.forEach((schedule: any) => {
          const venueString = schedule.venue || ''
          if (venueString.trim()) {
            const parsed = parseVenue(venueString)
            const existing = venueMap.get(venueString)
            if (existing) {
              existing.count++
            } else {
              venueMap.set(venueString, {
                city: parsed.city,
                country: parsed.country,
                count: 1
              })
            }
          }
        })

        setVenuesFromSchedules(venueMap)
      } catch (err) {
        console.error('Error fetching venues from schedules:', err)
      } finally {
        setLoadingSchedules(false)
      }
    }

    fetchVenuesFromSchedules()
  }, [])

  // Combine database venues with venues from schedules
  const allVenues = useMemo(() => {
    const combined = new Map<string, Venue>()
    
    // Add database venues first
    databaseVenues.forEach(venue => {
      const key = `${venue.city.trim().toLowerCase()}, ${venue.country.trim().toLowerCase()}`
      combined.set(key, venue)
    })
    
    // Add or update with venues from schedules
    venuesFromSchedules.forEach((data, venueString) => {
      const key = `${data.city.trim().toLowerCase()}, ${data.country.trim().toLowerCase()}`
      const existing = combined.get(key)
      
      if (existing) {
        // Update existing venue with schedule count
        existing.scheduleCount = data.count
      } else {
        // Add new venue from schedule (not in database)
        combined.set(key, {
          id: `schedule-${venueString}`, // Temporary ID for venues not in database
          name: venueString,
          city: data.city,
          country: data.country,
          status: 'Active' as const,
          scheduleCount: data.count,
          isFromDatabase: false
        })
      }
    })
    
    return Array.from(combined.values()).sort((a, b) => {
      // Sort by name
      return a.name.localeCompare(b.name)
    })
  }, [databaseVenues, venuesFromSchedules])

  // Filter venues based on search and status
  const filteredVenues = useMemo(() => {
    let filtered = allVenues

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((venue) => {
        const name = venue.name?.toLowerCase() || ''
        const city = venue.city?.toLowerCase() || ''
        const country = venue.country?.toLowerCase() || ''
        return name.includes(searchLower) || city.includes(searchLower) || country.includes(searchLower)
      })
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((venue) => venue.status === filterStatus)
    }

    return filtered
  }, [allVenues, searchTerm, filterStatus])

  const handleDelete = async () => {
    if (!venueToDelete) return

    try {
      const response = await fetch(`/api/admin/venues?id=${venueToDelete.id}`, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        // Refresh database venues
        const refreshResponse = await fetch('/api/admin/venues?limit=1000')
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setDatabaseVenues(refreshResult.data.map((v: any) => ({ 
            ...v, 
            id: String(v.id),
            isFromDatabase: true,
            scheduleCount: 0
          })))
        }
      }
    } catch (err) {
      console.error('Error deleting venue:', err)
      alert('Failed to delete venue. Please try again.')
    } finally {
      setDeleteConfirmOpen(false)
      setVenueToDelete(null)
    }
  }

  const handleAddFromSchedule = async (venue: Venue) => {
    if (!venue || venue.isFromDatabase) return

    try {
      const response = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venue.name,
          city: venue.city,
          country: venue.country,
          status: 'Active'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh database venues
        const refreshResponse = await fetch('/api/admin/venues?limit=1000')
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setDatabaseVenues(refreshResult.data.map((v: any) => ({ 
            ...v, 
            id: String(v.id),
            isFromDatabase: true,
            scheduleCount: 0
          })))
          alert(`Venue "${venue.name}" added to database successfully!`)
        }
      } else {
        alert(`Failed to add venue: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error adding venue:', err)
      alert('Failed to add venue. Please try again.')
    }
  }

  const handleEdit = (id: string) => {
    if (onEditVenue) {
      onEditVenue(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "Inactive":
        return "bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Selection handlers
  const handleSelectVenue = (venueId: string, checked: boolean) => {
    setSelectedVenues(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(venueId)
      } else {
        newSet.delete(venueId)
      }
      return newSet
    })
  }

  const handleSelectAllVenues = (checked: boolean) => {
    if (checked) {
      setSelectedVenues(new Set(filteredVenues.map(v => v.id)))
    } else {
      setSelectedVenues(new Set())
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

  const handleExportVenues = (exportFormat: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedVenues)
    const dataToExport = selectedIds.length > 0
      ? filteredVenues.filter(v => selectedIds.includes(v.id))
      : filteredVenues

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(venue => ({
      'Venue Name': venue.name,
      'City': venue.city,
      'Country': venue.country,
      'Status': venue.status,
      'Schedules': venue.scheduleCount || 0,
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `venues_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
    if (exportFormat === 'csv') {
      exportToCSV(exportData, filename)
    } else {
      exportToExcel(exportData, filename)
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Venue Management</h1>
          <p className="theme-muted">Manage all training venues and locations</p>
        </div>
        <div className="flex items-center gap-3">
          {filteredVenues.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedVenues.size > 0 && (
                <span className="text-sm theme-muted">
                  {selectedVenues.size} selected
                </span>
              )}
              <Button
                onClick={() => handleExportVenues('csv')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV {selectedVenues.size > 0 && `(${selectedVenues.size})`}
              </Button>
              <Button
                onClick={() => handleExportVenues('excel')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Excel {selectedVenues.size > 0 && `(${selectedVenues.size})`}
              </Button>
            </div>
          )}
          <button
            onClick={onAddVenue}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
          >
            <Plus size={20} />
            Add New Venue
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search venues by name, city, or country..."
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
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "Active" | "Inactive")}
          className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Info Banner */}
      <div className="theme-card rounded-xl p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm theme-text">
              <strong>Venue Management:</strong> Showing all venues from database and schedules. 
              Venues with <Badge variant="outline" className="ml-1 mr-1">Schedule Only</Badge> badge are used in schedules but not yet in the database. 
              Click "Add to Database" to add them.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(loadingDatabase || loadingSchedules) && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading venues...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loadingDatabase && !loadingSchedules && (
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

      {/* Venues Table */}
      {!loadingDatabase && !loadingSchedules && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredVenues.length === 0 ? (
            <div className="text-center py-12 theme-muted">
              <p className="text-lg">No venues found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Click \"Add New Venue\" to get started"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredVenues.length > 0 && filteredVenues.every(v => selectedVenues.has(v.id))}
                      onCheckedChange={(checked) => handleSelectAllVenues(checked === true)}
                      title="Select all"
                      className="border border-gray-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Venue Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">City</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Schedules</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => (
                  <tr 
                    key={venue.id} 
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${venue.isFromDatabase ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (venue.isFromDatabase) { setPreviewVenue(venue); setShowPreview(true) } }}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedVenues.has(venue.id)}
                        onCheckedChange={(checked) => handleSelectVenue(venue.id, checked === true)}
                        className="border border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="theme-text font-medium">{venue.name}</span>
                        {!venue.isFromDatabase && (
                          <Badge variant="outline" className="text-xs">Schedule Only</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-muted">{venue.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-muted">{venue.country}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(venue.status)}`}>
                        {venue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-muted text-sm">
                        {venue.scheduleCount || 0} schedule{venue.scheduleCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {venue.isFromDatabase ? (
                          <>
                            <button 
                              onClick={() => { setPreviewVenue(venue); setShowPreview(true) }}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                              title="Preview"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleEdit(venue.id)}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setVenueToDelete({ id: venue.id, name: venue.name })
                                setDeleteConfirmOpen(true)
                              }}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleAddFromSchedule(venue)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Download size={14} />
                            Add to Database
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewVenue?.name}</DialogTitle>
          </DialogHeader>
          
          {previewVenue && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold theme-text mb-2">City</h3>
                  <p className="theme-muted">{previewVenue.city}</p>
                </div>
                <div>
                  <h3 className="font-semibold theme-text mb-2">Country</h3>
                  <p className="theme-muted">{previewVenue.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold theme-text mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(previewVenue.status)}`}>
                    {previewVenue.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold theme-text mb-2">Schedules</h3>
                  <p className="theme-muted">{previewVenue.scheduleCount || 0} schedule{(previewVenue.scheduleCount || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {!previewVenue.isFromDatabase && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm theme-text">
                    <strong>Note:</strong> This venue is used in schedules but not yet added to the database. 
                    Use the "Add to Database" button to add it.
                  </p>
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
              This action cannot be undone. This will permanently delete the venue "{venueToDelete?.name}".
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

