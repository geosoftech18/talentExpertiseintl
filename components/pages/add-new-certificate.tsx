"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react"

export default function AddNewCertificate({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load certificate data if editing
  useEffect(() => {
    if (editId) {
      const loadCertificate = async () => {
        try {
          setLoading(true)
          const response = await fetch('/api/admin/certificates?limit=1000')
          const result = await response.json()
          
          if (result.success) {
            const certificate = result.data.find((c: any) => String(c.id) === editId)
            if (certificate) {
              setFormData({
                name: certificate.name || "",
                description: certificate.description || "",
              })
              if (certificate.imageUrl) {
                setImagePreview(certificate.imageUrl)
              }
            }
          }
        } catch (err) {
          console.error('Error loading certificate:', err)
        } finally {
          setLoading(false)
        }
      }
      loadCertificate()
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
      // Use imagePreview (base64) or existing imageUrl
      const imageUrl = imagePreview || null

      const payload = {
        id: editId,
        name: formData.name,
        description: formData.description || null,
        imageUrl: imageUrl,
      }

      const response = await fetch('/api/admin/certificates', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} certificate`)
      }

      alert(`Certificate ${isEditMode ? 'updated' : 'created'} successfully!`)
      if (onBack) onBack()
    } catch (error) {
      console.error('Error creating certificate:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create certificate. Please try again.')
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
              <h1 className="text-4xl font-bold theme-text mb-2">{isEditMode ? 'Edit Certificate' : 'Add New Certificate'}</h1>
              <p className="theme-muted">{isEditMode ? 'Update certificate information' : 'Create a new certificate'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="theme-card rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
                Certificate Information
              </h2>
            </div>

            <div className="space-y-6">
              {/* Certificate Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Certificate Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter certificate name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px] resize-y"
                  placeholder="Enter certificate description (optional)"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Certificate Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={imagePreview}
                          alt="Certificate preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive/90 text-white rounded-full hover:bg-destructive transition-colors"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-10 h-10 mb-3 theme-muted" />
                        <p className="mb-2 text-sm theme-text">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs theme-muted">PNG, JPG, GIF up to 10MB</p>
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
                </div>
                {image && (
                  <p className="text-xs theme-muted">
                    {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Certificate' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

