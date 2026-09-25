"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Save, CheckIcon, ChevronDownIcon, Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { WORLD_COUNTRY_NAMES } from "@/lib/world-countries"

export default function AddNewVenue({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    status: "Active",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<string[]>([])
  const [countrySearchOpen, setCountrySearchOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [loadingCountries, setLoadingCountries] = useState(true)

  // Fetch unique countries from venues
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (result.success) {
          // Extract unique countries and sort them
          const countryArray: string[] = result.data
            .map((v: any) => v.country as string | null | undefined)
            .filter((country: string | null | undefined): country is string => 
              typeof country === 'string' && country.trim().length > 0
            )
          
          // Venue countries preserved as-is; world list fills gaps. Set dedupes exact name matches only.
          const uniqueCountries = Array.from(
            new Set([...countryArray, ...WORLD_COUNTRY_NAMES])
          ).sort((a, b) => a.localeCompare(b))

          setCountries(uniqueCountries)
        }
      } catch (err) {
        console.error('Error fetching countries:', err)
        setCountries([])
      } finally {
        setLoadingCountries(false)
      }
    }
    
    fetchCountries()
  }, [])

  // Load venue data if editing
  useEffect(() => {
    if (!editId) return

    const loadVenue = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/venues?id=${encodeURIComponent(editId)}`)
        const result = await response.json()

        if (result.success && result.data) {
          const venue = result.data
          setFormData({
            city: venue.city || "",
            country: venue.country || "",
            status: venue.status || "Active",
          })
          if (venue.imageUrl) {
            setImagePreview(venue.imageUrl)
            setRemoveImage(false)
          } else {
            setImagePreview(null)
            setRemoveImage(false)
          }
        }
      } catch (err) {
        console.error('Error loading venue:', err)
      } finally {
        setLoading(false)
      }
    }
    loadVenue()
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
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setRemoveImage(false)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setImagePreview(null)
    setRemoveImage(true)
  }

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries
    
    const searchLower = countrySearch.toLowerCase()
    return countries.filter((country) =>
      country.toLowerCase().includes(searchLower)
    )
  }, [countries, countrySearch])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Auto-generate name from city and country (format: "City, Country")
      const venueName = formData.city && formData.country 
        ? `${formData.city}, ${formData.country}`
        : formData.city || formData.country || ""

      const payload: Record<string, unknown> = {
        id: editId,
        name: venueName,
        ...formData,
      }

      // Optional custom image: keep Wikipedia default when empty
      if (removeImage) {
        payload.imageUrl = null
      } else if (imagePreview) {
        payload.imageUrl = imagePreview
      }

      const response = await fetch('/api/admin/venues', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} venue`)
      }

      alert(`Venue ${isEditMode ? 'updated' : 'created'} successfully!`)
      if (onBack) onBack()
    } catch (error) {
      console.error('Error creating venue:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create venue. Please try again.')
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
              <h1 className="text-4xl font-bold theme-text mb-2">{isEditMode ? 'Edit Venue' : 'Add New Venue'}</h1>
              <p className="theme-muted">{isEditMode ? 'Update venue information' : 'Create a new training venue location'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="theme-card rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold theme-text border-b border-border pb-3">
                Venue Information
              </h2>
              <p className="text-sm theme-muted mt-2 mb-4">
                Venue name will be automatically generated as "City, Country" format
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter city"
                  required
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold theme-text">
                  Country <span className="text-destructive">*</span>
                </label>
                {loadingCountries ? (
                  <div className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text">
                    Loading countries...
                  </div>
                ) : countries.length === 0 ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter country"
                    required
                  />
                ) : (
                  <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countrySearchOpen}
                        className="w-full justify-between bg-input border-border theme-text h-11 font-normal"
                      >
                        <span className="truncate">
                          {formData.country || "Select a country..."}
                        </span>
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search countries..."
                          value={countrySearch}
                          onValueChange={setCountrySearch}
                        />
                        <CommandList>
                          <CommandEmpty>No country found matching "{countrySearch}".</CommandEmpty>
                          <CommandGroup>
                            {filteredCountries.map((country) => (
                              <CommandItem
                                key={country}
                                value={country}
                                onSelect={() => {
                                  handleInputChange("country", country)
                                  setCountrySearchOpen(false)
                                  setCountrySearch("")
                                }}
                                className="cursor-pointer"
                              >
                                <CheckIcon
                                  className={`mr-2 h-4 w-4 ${
                                    formData.country === country
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <span>{country}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
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
                </select>
              </div>
            </div>

            {/* Optional venue image */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="block text-sm font-semibold theme-text">
                  Venue Image <span className="theme-muted font-normal">(optional)</span>
                </label>
                <p className="text-sm theme-muted mt-1">
                  Leave empty to keep the default Wikipedia city image used on the homepage and venue page.
                </p>
                <ul className="mt-2 text-xs theme-muted space-y-1 list-disc list-inside">
                  <li>
                    <span className="font-medium theme-text">Choose Your Venue carousel:</span>{" "}
                    recommended <span className="font-mono">900 × 600 px</span> (3:2). Card display is about 300 × 200.
                  </li>
                  <li>
                    <span className="font-medium theme-text">Venue detail hero:</span>{" "}
                    recommended <span className="font-mono">1920 × 800 px</span> (wide). Keep the main subject centered — edges may crop on different screens.
                  </li>
                  <li>Best overall upload: <span className="font-mono">1920 × 800 px</span> or larger, JPG/PNG/WebP, max 10MB.</li>
                </ul>
              </div>

              {imagePreview ? (
                <div className="relative w-full max-w-xl aspect-[3/2] rounded-lg overflow-hidden border border-border bg-muted/30">
                  <img
                    src={imagePreview}
                    alt="Venue preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-3 right-3 p-2 bg-destructive/90 text-white rounded-lg hover:bg-destructive transition-colors"
                    title="Remove image (use Wikipedia default)"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-white text-xs px-3 py-2">
                    Preview (3:2 crop — matches carousel card)
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-xl aspect-[3/2] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
                  <Upload className="w-8 h-8 mb-2 theme-muted" />
                  <p className="text-sm theme-text font-medium">Upload venue image</p>
                  <p className="text-xs theme-muted mt-1">JPG, PNG, or WebP · up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                      e.target.value = ""
                    }}
                  />
                </label>
              )}

              {!imagePreview && (
                <p className="text-xs theme-muted flex items-center gap-1.5">
                  <ImageIcon size={14} />
                  No custom image — Wikipedia default will be used automatically.
                </p>
              )}
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
              disabled={isSubmitting || loading}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Venue' : 'Save Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
