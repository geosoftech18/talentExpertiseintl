"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Eye, X, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Certificate {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function Certificates({ onAddCertificate, onEditCertificate }: { onAddCertificate?: () => void; onEditCertificate?: (id: string) => void }) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewCertificate, setPreviewCertificate] = useState<Certificate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [certificateToDelete, setCertificateToDelete] = useState<{ id: string; name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/certificates?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch certificates')
        }

        setCertificates(result.data.map((c: any) => ({
          ...c,
          id: String(c.id),
        })))
      } catch (err) {
        console.error('Error fetching certificates:', err)
        setError(err instanceof Error ? err.message : 'Failed to load certificates')
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  // Filter certificates based on search
  const filteredCertificates = useMemo(() => {
    if (!searchTerm) return certificates
    
    const searchLower = searchTerm.toLowerCase()
    return certificates.filter((cert) =>
      cert.name.toLowerCase().includes(searchLower) ||
      (cert.description && cert.description.toLowerCase().includes(searchLower))
    )
  }, [certificates, searchTerm])

  const handleDelete = async () => {
    if (!certificateToDelete) return

    try {
      const response = await fetch(`/api/admin/certificates?id=${certificateToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete certificate')
      }

      // Remove from list
      setCertificates((prev) => prev.filter((c) => c.id !== certificateToDelete.id))
      setDeleteConfirmOpen(false)
      setCertificateToDelete(null)
    } catch (err) {
      console.error('Error deleting certificate:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete certificate')
    }
  }

  if (loading) {
    return (
      <div className="p-8 theme-bg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Certificate Management</h1>
          <p className="theme-muted">Manage certificates and certifications</p>
        </div>
        <button
          onClick={onAddCertificate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
        >
          <Plus size={20} />
          Add New Certificate
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search certificates by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="theme-card rounded-xl p-12 text-center">
          <p className="text-lg theme-muted mb-4">
            {searchTerm ? 'No certificates found matching your search.' : 'No certificates found.'}
          </p>
          {!searchTerm && onAddCertificate && (
            <button
              onClick={onAddCertificate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
            >
              <Plus size={20} />
              Add Your First Certificate
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate.id}
              className="theme-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Certificate Image */}
              <div className="relative h-48 bg-muted flex items-center justify-center">
                {certificate.imageUrl ? (
                  <img
                    src={certificate.imageUrl}
                    alt={certificate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 theme-muted">
                    <ImageIcon size={48} />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Certificate Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold theme-text mb-2">{certificate.name}</h3>
                  {certificate.description && (
                    <p className="text-sm theme-muted line-clamp-2">{certificate.description}</p>
                  )}
                  <Badge 
                    variant={certificate.status === 'Active' ? 'default' : 'secondary'} 
                    className="mt-2"
                  >
                    {certificate.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setPreviewCertificate(certificate)
                      setShowPreview(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-primary/10 rounded-lg transition-colors theme-text"
                  >
                    <Eye size={18} />
                    View
                  </button>
                  <button
                    onClick={() => onEditCertificate?.(certificate.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors theme-primary"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setCertificateToDelete({ id: certificate.id, name: certificate.name })
                      setDeleteConfirmOpen(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewCertificate?.name}</DialogTitle>
          </DialogHeader>
          {previewCertificate && (
            <div className="space-y-4">
              {previewCertificate.imageUrl && (
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={previewCertificate.imageUrl}
                    alt={previewCertificate.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {previewCertificate.description && (
                <div>
                  <h4 className="font-semibold theme-text mb-2">Description</h4>
                  <p className="theme-muted whitespace-pre-wrap">{previewCertificate.description}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold theme-text mb-2">Status</h4>
                <Badge 
                  variant={previewCertificate.status === 'Active' ? 'default' : 'secondary'}
                >
                  {previewCertificate.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{certificateToDelete?.name}"? This action cannot be undone.
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

