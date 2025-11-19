"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Image as ImageIcon, Eye, EyeOff } from "lucide-react"

export default function AddNewTeamMember({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "Active",
    password: "",
    notes: "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [loading, setLoading] = useState(false)

  // Load team member data if editing
  useEffect(() => {
    if (editId) {
      const loadTeamMember = async () => {
        try {
          setLoading(true)
          const response = await fetch('/api/admin/team-members')
          const result = await response.json()
          
          if (result.success) {
            const member = result.data.find((m: any) => String(m.id) === editId)
            if (member) {
              setFormData({
                firstName: member.firstName || "",
                lastName: member.lastName || "",
                email: member.email || "",
                phone: member.phone || "",
                role: member.role || "",
                department: member.department || "",
                status: member.status || "Active",
                password: "", // Don't load password for security
                notes: member.notes || "",
              })
              if (member.imageUrl) {
                setImagePreview(member.imageUrl)
              }
            }
          }
        } catch (err) {
          console.error('Error loading team member:', err)
        } finally {
          setLoading(false)
        }
      }
      loadTeamMember()
    }
  }, [editId])

  const roles = [
    "User",
    "Support Staff",
  ]

  const departments = [
    "Management",
    "Content",
    "Course Management",
    "Support",
  
  ]


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
      const imageUrl = imagePreview // This should be replaced with actual uploaded image URL
      // TODO: Hash password before storing
      const hashedPassword = formData.password // Should be hashed with bcrypt or similar

      const payload: any = {
        id: editId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        department: formData.department || null,
        status: formData.status,
        imageUrl: imageUrl || null,
        notes: formData.notes || null,
      }

      // Only include password if provided (for updates) or if creating new
      if (!isEditMode || formData.password) {
        payload.password = hashedPassword || null
      }

      const response = await fetch('/api/admin/team-members', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} team member`)
      }

      alert(`Team member ${isEditMode ? 'updated' : 'created'} successfully!`)
      if (onBack) onBack()
    } catch (error) {
      console.error('Error creating team member:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create team member. Please try again.')
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
              <h1 className="text-4xl font-bold theme-text mb-2">{isEditMode ? 'Edit Team Member' : 'Add New Team Member'}</h1>
              <p className="theme-muted">{isEditMode ? 'Update team member account and permissions' : 'Create a new team member account with access permissions'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="theme-card rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter phone number"
                />
              </div>

             

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full px-4 py-2 pr-10 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-muted hover:theme-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">Profile Image</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute -top-2 -right-2 p-1.5 bg-destructive/90 text-white rounded-full hover:bg-destructive transition-colors"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-full cursor-pointer hover:border-primary transition-colors bg-muted/30">
                    <ImageIcon className="w-6 h-6 mb-1 theme-muted" />
                    <p className="text-xs theme-text text-center">Upload</p>
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
          </div>

          {/* Role & Permissions */}
          <div className="theme-card rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
              Role & Permissions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Department <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Status <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="theme-card rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
              Additional Information
            </h2>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold theme-text">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                placeholder="Add any additional notes about this team member..."
              />
            </div>

            {/* Send Welcome Email */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="sendWelcomeEmail" className="theme-text text-sm cursor-pointer">
                Send welcome email with login credentials
              </label>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 theme-card border border-border rounded-lg font-semibold theme-text hover:bg-muted transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Team Member' : 'Save Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

