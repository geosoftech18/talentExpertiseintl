"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Image from "next/image"

interface Mentor {
  id: string
  name: string
  email: string
  imageUrl: string | null
  bio: string | null
  yearsOfExperience: number | null
}

export default function Mentors({ onAddMentor, onEditMentor }: { onAddMentor?: () => void; onEditMentor?: (id: string) => void }) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [previewMentor, setPreviewMentor] = useState<Mentor | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [mentorToDelete, setMentorToDelete] = useState<{ id: string; name: string } | null>(null)

  // Fetch mentors from database
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/mentors')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch mentors')
        }

        setMentors(result.data)
      } catch (err) {
        console.error('Error fetching mentors:', err)
        setError(err instanceof Error ? err.message : 'Failed to load mentors')
        setMentors([])
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  // Filter mentors based on search query
  const filteredMentors = mentors.filter((mentor) => {
    const query = searchQuery.toLowerCase()
    return (
      mentor.name.toLowerCase().includes(query) ||
      mentor.email.toLowerCase().includes(query) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(query))
    )
  })

  const handleDelete = async () => {
    if (!mentorToDelete) return

    try {
      const response = await fetch(`/api/admin/mentors?id=${mentorToDelete.id}`, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        const response = await fetch('/api/admin/mentors')
        const result = await response.json()
        if (result.success) {
          setMentors(result.data)
        }
      }
    } catch (err) {
      console.error('Error deleting mentor:', err)
      alert('Failed to delete mentor. Please try again.')
    } finally {
      setDeleteConfirmOpen(false)
      setMentorToDelete(null)
    }
  }

  const handleEdit = (id: string) => {
    if (onEditMentor) {
      onEditMentor(id)
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Mentors</h1>
          <p className="theme-muted">Manage all mentors and their profiles</p>
        </div>
        <button
          onClick={onAddMentor}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
        >
          <Plus size={20} />
          Add New Mentor
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search mentors by name, email, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
          <option>All Experience Levels</option>
          <option>0-5 years</option>
          <option>6-10 years</option>
          <option>11-15 years</option>
          <option>16+ years</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="theme-card rounded-xl p-8 text-center">
          <p className="theme-muted">Loading mentors...</p>
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

      {/* Mentors Table */}
      {!loading && !error && (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg">
          {filteredMentors.length === 0 ? (
            <div className="text-center py-12 theme-muted">
              <p className="text-lg">{searchQuery ? 'No mentors found matching your search' : 'No mentors found'}</p>
              <p className="text-sm mt-2">
                {searchQuery ? 'Try a different search term' : 'Click "Add New Mentor" to get started'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Profile</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Bio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.map((mentor) => (
                  <tr key={mentor.id} className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setPreviewMentor(mentor); setShowPreview(true) }}>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        <img
                          src={mentor.imageUrl || "/placeholder-user.jpg"}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-text font-medium">{mentor.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-muted">{mentor.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-muted text-sm line-clamp-2 max-w-md">
                        {mentor.bio || 'No bio available'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="theme-accent font-medium">
                        {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} years` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setPreviewMentor(mentor); setShowPreview(true) }}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(mentor.id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setMentorToDelete({ id: mentor.id, name: mentor.name })
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewMentor?.name}</DialogTitle>
          </DialogHeader>
          
          {previewMentor && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                  <img
                    src={previewMentor.imageUrl || "/placeholder-user.jpg"}
                    alt={previewMentor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold theme-text">{previewMentor.name}</h3>
                  <p className="theme-muted">{previewMentor.email}</p>
                  {previewMentor.yearsOfExperience && (
                    <p className="theme-accent font-medium mt-1">
                      {previewMentor.yearsOfExperience} years of experience
                    </p>
                  )}
                </div>
              </div>
              
              {previewMentor.bio && (
                <div>
                  <h3 className="font-semibold theme-text mb-2">Bio</h3>
                  <p className="theme-muted">{previewMentor.bio}</p>
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
              This action cannot be undone. This will permanently delete the mentor "{mentorToDelete?.name}".
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

