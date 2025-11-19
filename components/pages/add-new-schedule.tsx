"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, CheckIcon, ChevronDownIcon, SearchIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Program interface (for transformed data used in form)
interface Program {
  id: string
  refCode: string
  name: string
  category: string
  type: string
  status: string
  duration: string
}

// Mentor interface (for database mentors)
interface Mentor {
  id: string
  name: string
  email: string
  imageUrl: string | null
  bio: string | null
  yearsOfExperience: number | null
}

// Venue interface
interface Venue {
  id: string
  name: string
  city: string
  country: string
  status: string
}

export default function AddNewSchedule({ onBack, editId }: { onBack?: () => void; editId?: string | null }) {
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    program: "",
    mentor: "",
    startDate: "",
    endDate: "",
    venue: "",
    fee: "",
    status: "Open",
  })

  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loadingMentors, setLoadingMentors] = useState(true)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [programSearchOpen, setProgramSearchOpen] = useState(false)
  const [programSearch, setProgramSearch] = useState("")
  const [loadingData, setLoadingData] = useState(false)

  // Load schedule data if editing
  useEffect(() => {
    if (editId) {
      const loadSchedule = async () => {
        try {
          setLoadingData(true)
          const response = await fetch('/api/admin/schedules')
          const result = await response.json()
          
          if (result.success) {
            const schedule = result.data.find((s: any) => s.id === editId)
            if (schedule) {
              setFormData({
                program: schedule.programName || schedule.program?.programName || "",
                mentor: schedule.mentorId || "",
                startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : "",
                endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : "",
                venue: schedule.venue || "",
                fee: schedule.fee ? String(schedule.fee) : "",
                status: schedule.status || "Open",
              })
            }
          }
        } catch (err) {
          console.error('Error loading schedule:', err)
        } finally {
          setLoadingData(false)
        }
      }
      loadSchedule()
    }
  }, [editId])

  // Fetch programs from database
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true)
        const response = await fetch('/api/admin/programs')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch programs')
        }

        // Transform data for use in the form
        const transformedPrograms = result.data.map((program: any) => ({
          id: program.id,
          refCode: program.refCode,
          name: program.programName,
          category: program.category,
          type: Array.isArray(program.type) ? program.type.join(', ') : program.type || 'N/A',
          status: program.status,
          duration: program.duration,
        }))

        setPrograms(transformedPrograms)
      } catch (err) {
        console.error('Error fetching programs:', err)
        // Fallback to empty array if fetch fails
        setPrograms([])
      } finally {
        setLoadingPrograms(false)
      }
    }

    fetchPrograms()
  }, [])

  // Fetch venues from database
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingVenues(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch venues')
        }

        // Filter only active venues and sort by name
        const activeVenues = result.data
          .filter((venue: any) => venue.status === 'Active')
          .map((venue: any) => ({
            id: String(venue.id),
            name: venue.name,
            city: venue.city,
            country: venue.country,
            status: venue.status,
          }))
          .sort((a: Venue, b: Venue) => a.name.localeCompare(b.name))

        setVenues(activeVenues)
      } catch (err) {
        console.error('Error fetching venues:', err)
        setVenues([])
      } finally {
        setLoadingVenues(false)
      }
    }

    fetchVenues()
  }, [])

  // Fetch mentors from database
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoadingMentors(true)
        const response = await fetch('/api/admin/mentors')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch mentors')
        }

        setMentors(result.data)
      } catch (err) {
        console.error('Error fetching mentors:', err)
        // Fallback to empty array if fetch fails
        setMentors([])
      } finally {
        setLoadingMentors(false)
      }
    }

    fetchMentors()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      program: "",
      mentor: "",
      startDate: "",
      endDate: "",
      venue: "",
      fee: "",
      status: "Open",
    })
    setProgramSearch("")
    setProgramSearchOpen(false)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent, resetAfterSave = false) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Find program by name to get ID
      const selectedProgram = programs.find(p => p.name === formData.program)
      
      if (!selectedProgram) {
        throw new Error('Please select a valid program')
      }
      
      // Find mentor by ID
      const selectedMentor = formData.mentor ? mentors.find(m => m.id === formData.mentor) : null
      
      const payload = {
        id: editId,
        programId: selectedProgram.id,
        programName: selectedProgram.name,
        mentorId: selectedMentor?.id || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        venue: formData.venue,
        fee: formData.fee ? parseFloat(formData.fee.replace(/[^\d.]/g, '')) : null,
        status: formData.status,
      }

      const response = await fetch('/api/admin/schedules', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} schedule`)
      }

      alert(`Schedule ${isEditMode ? 'updated' : 'created'} successfully!`)
      
      // After successful save, reset form if resetAfterSave is true
      if (resetAfterSave) {
        resetForm()
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (onBack) {
        onBack()
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create schedule. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAndAddAnother = (e: React.FormEvent) => {
    handleSubmit(e, true)
  }

  // Filter programs based on search (by name, reference code, or category)
  const filteredPrograms = programs.filter((program) => {
    if (!programSearch.trim()) {
      return true
    }
    const searchLower = programSearch.toLowerCase().trim()
    return (
      program.name?.toLowerCase().includes(searchLower) ||
      program.refCode?.toLowerCase().includes(searchLower) ||
      program.category?.toLowerCase().includes(searchLower)
    )
  })

  // Get selected program details
  const selectedProgram = programs.find((p) => p.name === formData.program)

  return (
    <div className="min-h-screen theme-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold theme-text">{isEditMode ? 'Edit Schedule Program' : 'Add New Schedule Program'}</h1>
              <p className="text-sm theme-muted mt-1">{isEditMode ? 'Update schedule program details' : 'Create a new schedule program entry'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="theme-card rounded-xl p-6 border border-border shadow-lg">
            <h2 className="text-xl font-semibold theme-text mb-6 pb-3 border-b border-border">
              Schedule Information
            </h2>

            {/* Course Field - Searchable Dropdown */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="program" className="text-sm font-medium theme-text">
                Course <span className="text-destructive">*</span>
              </Label>
              {loadingPrograms ? (
                <div className="p-4 text-center theme-muted">
                  Loading programs...
                </div>
              ) : programs.length === 0 ? (
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm theme-muted mb-2">No programs found.</p>
                  <p className="text-xs theme-muted">Please create a program first before scheduling.</p>
                </div>
              ) : (
                <Popover open={programSearchOpen} onOpenChange={setProgramSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={programSearchOpen}
                      className="w-full justify-between bg-input border-border theme-text h-11"
                    >
                      <span className="truncate">
                        {formData.program || "Select a course..."}
                      </span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search courses by name, ref code, or category..."
                        value={programSearch}
                        onValueChange={setProgramSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No course found matching "{programSearch}".</CommandEmpty>
                        <CommandGroup>
                          {filteredPrograms.map((program) => (
                          <CommandItem
                            key={program.id}
                            value={`${program.name} ${program.refCode} ${program.category}`}
                            onSelect={() => {
                              handleInputChange("program", program.name)
                              setProgramSearchOpen(false)
                              setProgramSearch("")
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={`mr-2 h-4 w-4 ${
                                formData.program === program.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{program.name}</span>
                              <span className="text-xs theme-muted">
                                {program.refCode} • {program.category} • {program.duration}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              {selectedProgram && (
                <p className="text-xs theme-muted mt-1">
                  Ref Code: {selectedProgram.refCode} • Type: {selectedProgram.type} • Status: {selectedProgram.status}
                </p>
              )}
            </div>

            {/* Mentor Field - Dropdown */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="mentor" className="text-sm font-medium theme-text">
                Mentor <span className="text-destructive">*</span>
              </Label>
              {loadingMentors ? (
                <div className="p-4 text-center theme-muted">
                  Loading mentors...
                </div>
              ) : mentors.length === 0 ? (
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm theme-muted mb-2">No mentors found.</p>
                  <p className="text-xs theme-muted">Please create a mentor first before scheduling.</p>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.mentor}
                    onValueChange={(value) => handleInputChange("mentor", value)}
                    required
                  >
                    <SelectTrigger className="w-full bg-input border-border theme-text h-11">
                      <SelectValue placeholder="Select a mentor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.mentor && (
                    <div className="text-xs theme-muted mt-1 space-y-1">
                      {(() => {
                        const selectedMentor = mentors.find((m) => m.id === formData.mentor)
                        return selectedMentor ? (
                          <>
                            <p>
                              {selectedMentor.email} • {" "}
                              {selectedMentor.yearsOfExperience || 'N/A'} years experience
                            </p>
                            {selectedMentor.bio && (
                              <p className="italic">
                                {selectedMentor.bio}
                              </p>
                            )}
                          </>
                        ) : null
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium theme-text">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="bg-input border-border theme-text h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium theme-text">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="bg-input border-border theme-text h-11"
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* Venue Field - Dropdown */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="venue" className="text-sm font-medium theme-text">
                Venue <span className="text-destructive">*</span>
              </Label>
              {loadingVenues ? (
                <div className="w-full bg-input border border-border rounded-lg h-11 flex items-center px-4 theme-muted">
                  Loading venues...
                </div>
              ) : (
                <Select
                  value={formData.venue}
                  onValueChange={(value) => handleInputChange("venue", value)}
                  required
                >
                  <SelectTrigger className="w-full bg-input border-border theme-text h-11">
                    <SelectValue placeholder={venues.length === 0 ? "No venues available. Add venues first." : "Select a venue..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.length === 0 ? (
                      <SelectItem value="" disabled>
                        No venues available. Please add venues in Venue Management.
                      </SelectItem>
                    ) : (
                      venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.name}>
                          {venue.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Fee Field */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="fee" className="text-sm font-medium theme-text">
                Fee <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fee"
                type="text"
                placeholder="e.g., €4,500, £3,800, USD 5,200"
                value={formData.fee}
                onChange={(e) => handleInputChange("fee", e.target.value)}
                className="bg-input border-border theme-text h-11"
                required
              />
              <p className="text-xs theme-muted mt-1">
                Enter fee with currency symbol (e.g., €4,500, £3,800, USD 5,200)
              </p>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium theme-text">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                required
              >
                <SelectTrigger className="w-full bg-input border-border theme-text h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndAddAnother}
                className="px-6 border-primary text-primary"
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Save & Schedule Another
              </Button>
              <Button
                type="submit"
                className="px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground glow-electric disabled:opacity-50"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Schedule Program' : 'Save Schedule Program'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

