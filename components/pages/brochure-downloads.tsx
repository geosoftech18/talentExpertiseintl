"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Eye, X, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import * as XLSX from "xlsx"

interface BrochureDownload {
  id: string
  name: string
  email: string
  phone: string
  countryCode: string
  courseId?: string | null
  courseTitle?: string | null
  downloadedAt: string
  createdAt: string
}

export default function BrochureDownloads() {
  const [downloads, setDownloads] = useState<BrochureDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [previewDownload, setPreviewDownload] = useState<BrochureDownload | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedDownloads, setSelectedDownloads] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/forms/brochure-download?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch downloads')
        }

        if (result.success) {
          setDownloads(result.data)
        }
      } catch (err) {
        console.error('Error fetching downloads:', err)
        setError(err instanceof Error ? err.message : 'Failed to load downloads')
        setDownloads([])
      } finally {
        setLoading(false)
      }
    }

    fetchDownloads()
  }, [])

  // Filter downloads based on search term
  const filteredDownloads = useMemo(() => {
    if (!searchTerm.trim()) {
      return downloads
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return downloads.filter((download) => {
      const name = download.name?.toLowerCase() || ''
      const email = download.email?.toLowerCase() || ''
      const courseTitle = download.courseTitle?.toLowerCase() || ''
      const phone = download.phone?.toLowerCase() || ''
      
      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        courseTitle.includes(searchLower) ||
        phone.includes(searchLower)
      )
    })
  }, [downloads, searchTerm])

  const handlePreview = (download: BrochureDownload) => {
    setPreviewDownload(download)
    setShowPreview(true)
  }

  // Selection handlers
  const handleSelectDownload = (downloadId: string, checked: boolean) => {
    setSelectedDownloads(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(downloadId)
      } else {
        newSet.delete(downloadId)
      }
      return newSet
    })
  }

  const handleSelectAllDownloads = (checked: boolean) => {
    if (checked) {
      setSelectedDownloads(new Set(filteredDownloads.map(d => d.id)))
    } else {
      setSelectedDownloads(new Set())
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

  const handleExportDownloads = (exportFormat: 'csv' | 'excel') => {
    const selectedIds = Array.from(selectedDownloads)
    const dataToExport = selectedIds.length > 0
      ? filteredDownloads.filter(d => selectedIds.includes(d.id))
      : filteredDownloads

    if (dataToExport.length === 0) {
      alert('No data available to export')
      return
    }

    const exportData = dataToExport.map(download => ({
      'Name': download.name,
      'Email': download.email,
      'Phone': `${download.countryCode} ${download.phone}`,
      'Course': download.courseTitle || 'N/A',
      'Downloaded Date': download.downloadedAt ? format(new Date(download.downloadedAt), 'yyyy-MM-dd') : 'N/A',
    }))

    const selectedText = selectedIds.length > 0 ? `_${selectedIds.length}_selected` : '_all'
    const filename = `brochure_downloads_export_${new Date().toISOString().split('T')[0]}${selectedText}`
    
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
          <h1 className="text-4xl font-bold theme-text mb-2">Brochure Downloads</h1>
          <p className="theme-muted">View and manage all brochure download requests</p>
        </div>
        {filteredDownloads.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedDownloads.size > 0 && (
              <span className="text-sm theme-muted">
                {selectedDownloads.size} selected
              </span>
            )}
            <Button
              onClick={() => handleExportDownloads('csv')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV {selectedDownloads.size > 0 && `(${selectedDownloads.size})`}
            </Button>
            <Button
              onClick={() => handleExportDownloads('excel')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export Excel {selectedDownloads.size > 0 && `(${selectedDownloads.size})`}
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, course, or phone..."
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading downloads...</p>
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

      {/* Downloads Table */}
      {!loading && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredDownloads.length === 0 ? (
            <div className="p-8 text-center">
              {downloads.length === 0 ? (
                <p className="theme-muted mb-4">No brochure downloads found.</p>
              ) : (
                <p className="theme-muted mb-4">No downloads found matching "{searchTerm}". Try a different search term.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold theme-text w-12">
                    <Checkbox
                      checked={filteredDownloads.length > 0 && filteredDownloads.every(d => selectedDownloads.has(d.id))}
                      onCheckedChange={(checked) => handleSelectAllDownloads(checked === true)}
                      title="Select all"
                      className="border border-gray-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Downloaded Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.map((download) => (
                  <tr key={download.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedDownloads.has(download.id)}
                        onCheckedChange={(checked) => handleSelectDownload(download.id, checked === true)}
                        className="border border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4 theme-text font-medium">{download.name}</td>
                    <td className="px-6 py-4 theme-muted">{download.email}</td>
                    <td className="px-6 py-4 theme-muted">{download.countryCode} {download.phone}</td>
                    <td className="px-6 py-4 theme-text">
                      {download.courseTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 theme-muted">
                      {download.downloadedAt ? format(new Date(download.downloadedAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePreview(download)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
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
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Download className="w-5 h-5" />
              Brochure Download Details
            </DialogTitle>
            <DialogDescription>
              Downloaded on {previewDownload?.downloadedAt ? format(new Date(previewDownload.downloadedAt), 'PPP') : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          {previewDownload && (
            <div className="space-y-6 mt-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm theme-muted mb-1">Name</p>
                    <p className="theme-text font-medium">{previewDownload.name}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Email</p>
                    <p className="theme-text">{previewDownload.email}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-muted mb-1">Phone</p>
                    <p className="theme-text">{previewDownload.countryCode} {previewDownload.phone}</p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div>
                <h3 className="font-semibold theme-text mb-3 pb-2 border-b border-border">Course Information</h3>
                <div>
                  <p className="text-sm theme-muted mb-1">Course</p>
                  <p className="theme-text">{previewDownload.courseTitle || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

