"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Upload, Image as ImageIcon } from "lucide-react"

export default function AddNewMentor({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    yearsOfExperience: "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load mentor data if editing
  useEffect(() => {
    if (editId) {
      const loadMentor = async () => {
        try {
          setLoading(true)
          const response = await fetch('/api/admin/mentors')
          const result = await response.json()
          
          if (result.success) {
            const mentor = result.data.find((m: any) => m.id === editId)
            if (mentor) {
              setFormData({
                name: mentor.name || "",
                email: mentor.email || "",
                bio: mentor.bio || "",
                yearsOfExperience: mentor.yearsOfExperience ? String(mentor.yearsOfExperience) : "",
              })
              if (mentor.imageUrl) {
                setImagePreview(mentor.imageUrl)
              }
            }
          }
        } catch (err) {
          console.error('Error loading mentor:', err)
        } finally {
          setLoading(false)
        }
      }
      loadMentor()
    }
  }, [editId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB")
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setImage(null)
    setImagePreview(null)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // TODO: Handle image upload separately (upload to cloud storage first)
      // For now, we'll store imageUrl if provided
      const imageUrl = imagePreview // This should be replaced with actual uploaded image URL

      const payload = {
        id: editId,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        imageUrl: imageUrl || null,
      }

      const response = await fetch('/api/admin/mentors', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} mentor`)
      }

      alert(`Mentor ${isEditMode ? 'updated' : 'created'} successfully!`)
      // Reset form or navigate back
      if (onBack) onBack()
    } catch (error) {
      console.error('Error creating mentor:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create mentor. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen theme-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-muted rounded-lg transition-colors theme-primary"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-bold theme-text mb-2">{isEditMode ? 'Edit Mentor' : 'Add New Mentor'}</h1>
              <p className="theme-muted">{isEditMode ? 'Update mentor profile details' : 'Create a new mentor profile with comprehensive details'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="theme-card rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
              Mentor Information
            </h2>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter mentor's full name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter mentor's email address"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">
                Profile Image
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border">
                    <img
                      src={imagePreview}
                      alt="Mentor preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-full hover:bg-destructive transition-colors"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-full cursor-pointer hover:border-primary transition-colors bg-muted/30">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 mb-2 theme-muted" />
                      <p className="text-xs theme-text text-center px-2">
                        <span className="font-semibold">Upload</span>
                      </p>
                      <p className="text-xs theme-muted text-center px-2">Image</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(file)
                        }
                      }}
                    />
                  </label>
                )}
                {image && (
                  <p className="text-xs theme-muted">
                    {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">
                Bio <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={6}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                placeholder="Enter mentor's biography, expertise, and background..."
                required
              />
            </div>

            {/* Years of Experience Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">
                Years of Experience <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter years of experience"
                required
              />
              <p className="text-xs theme-muted">Enter the number of years of professional experience</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 theme-card border border-border rounded-lg font-semibold theme-text hover:bg-muted transition-all"
              >
                Cancel
              </button>
            )}
            {/* Error Message */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Mentor' : 'Save Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

