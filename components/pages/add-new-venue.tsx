"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Save, CheckIcon, ChevronDownIcon } from "lucide-react"
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

export default function AddNewVenue({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    status: "Active",
  })
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
          
          const uniqueCountries = Array.from(new Set(countryArray)).sort((a, b) => 
            a.localeCompare(b)
          )
          
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
    if (editId) {
      const loadVenue = async () => {
        try {
          setLoading(true)
          const response = await fetch('/api/admin/venues')
          const result = await response.json()
          
          if (result.success) {
            const venue = result.data.find((v: any) => String(v.id) === editId)
            if (venue) {
              setFormData({
                city: venue.city || "",
                country: venue.country || "",
                status: venue.status || "Active",
              })
            }
          }
        } catch (err) {
          console.error('Error loading venue:', err)
        } finally {
          setLoading(false)
        }
      }
      loadVenue()
    }
  }, [editId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

      const payload = {
        id: editId,
        name: venueName,
        ...formData,
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Venue' : 'Save Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

