'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/lib/supabase'

// Map phone country codes to ISO country codes for flags
const getCountryISO = (phoneCode: string): string => {
  const codeMap: { [key: string]: string } = {
    "+971": "ae", // United Arab Emirates
    "+1": "us", // United States (default, can be ca, mx, etc.)
    "+44": "gb", // United Kingdom
    "+65": "sg", // Singapore
    "+966": "sa", // Saudi Arabia
    "+974": "qa", // Qatar
    "+968": "om", // Oman
    "+965": "kw", // Kuwait
    "+973": "bh", // Bahrain
    "+91": "in", // India
    "+86": "cn", // China
    "+81": "jp", // Japan
    "+49": "de", // Germany
    "+33": "fr", // France
    "+39": "it", // Italy
    "+34": "es", // Spain
    "+61": "au", // Australia
    "+27": "za", // South Africa
    "+234": "ng", // Nigeria
    "+254": "ke", // Kenya
    "+20": "eg", // Egypt
    "+60": "my", // Malaysia
    "+66": "th", // Thailand
    "+62": "id", // Indonesia
    "+84": "vn", // Vietnam
    "+82": "kr", // South Korea
  }
  return codeMap[phoneCode] || "xx"
}

// Function to get flag image URL
const getFlagImageUrl = (phoneCode: string): string => {
  const isoCode = getCountryISO(phoneCode)
  return `https://flagcdn.com/w40/${isoCode}.png`
}

const countries = [
  { code: "+971", name: "United Arab Emirates", iso: "ae" },
  { code: "+1", name: "United States", iso: "us" },
  { code: "+44", name: "United Kingdom", iso: "gb" },
  { code: "+65", name: "Singapore", iso: "sg" },
  { code: "+966", name: "Saudi Arabia", iso: "sa" },
  { code: "+974", name: "Qatar", iso: "qa" },
  { code: "+968", name: "Oman", iso: "om" },
  { code: "+965", name: "Kuwait", iso: "kw" },
  { code: "+973", name: "Bahrain", iso: "bh" },
  { code: "+91", name: "India", iso: "in" },
  { code: "+86", name: "China", iso: "cn" },
  { code: "+81", name: "Japan", iso: "jp" },
  { code: "+49", name: "Germany", iso: "de" },
  { code: "+33", name: "France", iso: "fr" },
  { code: "+39", name: "Italy", iso: "it" },
  { code: "+34", name: "Spain", iso: "es" },
  { code: "+61", name: "Australia", iso: "au" },
  { code: "+27", name: "South Africa", iso: "za" },
  { code: "+234", name: "Nigeria", iso: "ng" },
  { code: "+254", name: "Kenya", iso: "ke" },
  { code: "+20", name: "Egypt", iso: "eg" },
  { code: "+60", name: "Malaysia", iso: "my" },
  { code: "+66", name: "Thailand", iso: "th" },
  { code: "+62", name: "Indonesia", iso: "id" },
  { code: "+84", name: "Vietnam", iso: "vn" },
  { code: "+82", name: "South Korea", iso: "kr" },
]

// Function to detect country code from phone number
const detectCountryCode = (phoneNumber: string, currentCountryCode: string = '+971'): string => {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return currentCountryCode
  }

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '').trim()
  
  // Step 1: Check if number starts with explicit country code (with +)
  if (cleaned.startsWith('+')) {
    // Sort countries by code length (longest first) to match longer codes first
    // This ensures +971 matches before +1, +9715 matches before +1, etc.
    const sortedCountries = [...countries].sort((a, b) => {
      const aCode = a.code.replace('+', '')
      const bCode = b.code.replace('+', '')
      return bCode.length - aCode.length
    })
    
    for (const country of sortedCountries) {
      const codeDigits = country.code.replace('+', '')
      // Check if cleaned starts with the country code (with +)
      if (cleaned.startsWith(country.code) && cleaned.length > country.code.length) {
        return country.code
      }
    }
    
    // If it starts with + but doesn't match any country code, return current
    // Don't try pattern matching as the user is explicitly typing with +
    return currentCountryCode
  }
  
  // Step 2: Extract just digits (remove + and leading zeros)
  let digitsOnly = cleaned.replace(/^\+/, '').replace(/^0+/, '')
  
  // If digitsOnly is empty after cleaning, return current code
  if (!digitsOnly || digitsOnly.length === 0) {
    return currentCountryCode
  }
  
  // Step 3: Check if the digits start with a known country code (without +)
  // Try matching country codes as prefixes
  const sortedCountries = [...countries].sort((a, b) => {
    const aCode = a.code.replace('+', '')
    const bCode = b.code.replace('+', '')
    return bCode.length - aCode.length
  })
  
  for (const country of sortedCountries) {
    const codeDigits = country.code.replace('+', '')
    if (digitsOnly.startsWith(codeDigits) && digitsOnly.length > codeDigits.length) {
      // Only return if there are additional digits after the country code
      return country.code
    }
  }
  
  // Step 4: Pattern-based detection for numbers without explicit country code
  // Country patterns: starting digits and expected length
  const patterns: { [key: string]: { startDigits: string[], length: number } } = {
    '+971': { startDigits: ['50', '52', '54', '55', '56', '58'], length: 9 }, // UAE mobile
    '+966': { startDigits: ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'], length: 9 }, // Saudi mobile
    '+91': { startDigits: ['6', '7', '8', '9'], length: 10 }, // India mobile (starts with 6-9)
    '+44': { startDigits: ['7'], length: 10 }, // UK mobile
    '+65': { startDigits: ['8', '9'], length: 8 }, // Singapore
    '+974': { startDigits: ['3', '5', '6', '7'], length: 8 }, // Qatar
    '+968': { startDigits: ['9'], length: 8 }, // Oman
    '+973': { startDigits: ['3', '6'], length: 8 }, // Bahrain
    '+965': { startDigits: ['5', '6', '9'], length: 8 }, // Kuwait
    '+20': { startDigits: ['1'], length: 10 }, // Egypt mobile
    '+60': { startDigits: ['1'], length: 9 }, // Malaysia mobile (can be 9-10)
    '+66': { startDigits: ['6', '8', '9'], length: 9 }, // Thailand mobile
    '+62': { startDigits: ['8'], length: 9 }, // Indonesia mobile
    '+84': { startDigits: ['3', '5', '7', '8', '9'], length: 9 }, // Vietnam mobile
    '+82': { startDigits: ['1'], length: 10 }, // South Korea mobile
    '+1': { startDigits: [], length: 10 }, // US/Canada (any 10 digits)
  }
  
  // Try to match patterns - check if digits start with known patterns
  for (const [countryCode, pattern] of Object.entries(patterns)) {
    // For countries without specific start patterns (like US), just check length
    if (pattern.startDigits.length === 0) {
      if (digitsOnly.length === pattern.length) {
        return countryCode
      }
      continue
    }
    
    // Check if digits start with any of the country's start patterns
    const matchesStart = pattern.startDigits.some(start => digitsOnly.startsWith(start))
    
    if (matchesStart) {
      // If we have the exact length, definitely this country
      if (digitsOnly.length === pattern.length) {
        return countryCode
      }
      // If we're close to the length (within 2 digits), likely this country
      if (digitsOnly.length >= pattern.length - 2 && digitsOnly.length <= pattern.length + 1) {
        return countryCode
      }
      // If we have enough digits to identify (at least 2-3 digits matching pattern), suggest this country
      if (digitsOnly.length >= 2 && digitsOnly.length < pattern.length) {
        // Only suggest if the pattern is a strong match (at least 2 digits match)
        const minPatternLength = Math.min(...pattern.startDigits.map(p => p.length))
        if (digitsOnly.length >= minPatternLength) {
          return countryCode
        }
      }
    }
  }
  
  // Step 5: If no pattern match but we have exact length matches, use that
  // This handles edge cases where pattern might not match but length does
  const exactLengthMatches: { [key: number]: string[] } = {}
  for (const [countryCode, pattern] of Object.entries(patterns)) {
    if (!exactLengthMatches[pattern.length]) {
      exactLengthMatches[pattern.length] = []
    }
    exactLengthMatches[pattern.length].push(countryCode)
  }
  
  if (exactLengthMatches[digitsOnly.length] && exactLengthMatches[digitsOnly.length].length === 1) {
    return exactLengthMatches[digitsOnly.length][0]
  }
  
  // Return current country code if no detection
  return currentCountryCode
}

interface CourseEnquiryFormProps {
  course: Course
  onClose: () => void
}

const steps = [
  { id: 1, title: 'Personal Info', description: 'Your contact details' },
  { id: 2, title: 'Company Info', description: 'Work information' },
  { id: 3, title: 'Course Details', description: 'Schedule & preferences' },
]

interface Schedule {
  id: string
  scheduleId: string
  programId: string
  startDate: string
  endDate: string | null
  venue: string | null
  price: number
}

export function CourseEnquiryForm({ course, onClose }: CourseEnquiryFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  
  // Fetch schedules for this course
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true)
        const response = await fetch('/api/schedules?limit=100')
        const result = await response.json()
        
        if (result.success) {
          // Filter schedules for this specific course
          const courseSchedules = result.data
            .filter((schedule: any) => schedule.programId === course.id)
            .map((schedule: any) => ({
              id: schedule.id,
              scheduleId: schedule.scheduleId,
              programId: schedule.programId,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              venue: schedule.venue,
              price: schedule.price,
            }))
          
          setSchedules(courseSchedules)
        }
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setSchedules([])
      } finally {
        setLoadingSchedules(false)
      }
    }
    
    fetchSchedules()
  }, [course.id])
  
  // Format date for display
  const formatScheduleDate = (startDate: string, endDate: string | null, venue: string | null) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    let dateStr = formatDate(start)
    if (end && endDate !== startDate) {
      dateStr += ` - ${formatDate(end)}`
    }
    
    if (venue) {
      dateStr += `, ${venue}`
    }
    
    return dateStr
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+971',
    company: '',
    jobTitle: '',
    schedulePreference: '',
    participants: '1',
    message: ''
  })

  const nextStep = () => {
    if (currentStep < steps.length && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone
      case 2:
        return formData.company
      case 3:
        return true // Optional fields
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === steps.length) {
      setIsSubmitting(true)
      setSubmitError(null)
      
      try {
        const response = await fetch('/api/forms/course-enquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            courseId: course.id,
            courseTitle: course.title,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit enquiry')
        }

        // Success - close the form or show success message
        alert('Thank you! Your enquiry has been submitted successfully.')
        onClose()
      } catch (error) {
        console.error('Error submitting enquiry:', error)
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      nextStep()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up shadow-2xl my-4">
        <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-white pb-3 pt-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 hover:bg-slate-200 rounded-full h-7 w-7"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900">Course Enquiry</CardTitle>
            </div>
            
            {/* Course Info - Compact */}
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Course:</span>
                <p className="text-xs font-medium text-slate-900 leading-relaxed line-clamp-1">{course.title}</p>
              </div>
              {course.course_code && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Code:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-mono text-xs h-5">
                    {course.course_code}
                  </Badge>
                </div>
              )}
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between mt-4 mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        currentStep > step.id
                          ? 'bg-blue-600 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <div className="text-xs font-medium text-slate-900">{step.title}</div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-3 min-h-[280px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      className="h-9 text-sm"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      className="h-9 text-sm"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className="h-9 text-sm"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                  <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    >
                      <SelectTrigger className="w-auto min-w-[100px] h-9 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                            <Image
                              src={getFlagImageUrl(formData.countryCode)}
                              alt={countries.find(c => c.code === formData.countryCode)?.name || "Country flag"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{formData.countryCode}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                <Image
                                  src={getFlagImageUrl(country.code)}
                                  alt={country.name}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                              <span className="text-sm">{country.name}</span>
                              <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter Your Phone Number"
                      className="h-9 text-sm border-0 rounded-none focus-visible:ring-0 flex-1"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const phoneValue = e.target.value
                        // Auto-detect country code from phone number
                        const detectedCode = detectCountryCode(phoneValue, formData.countryCode)
                        setFormData({ ...formData, phone: phoneValue, countryCode: detectedCode })
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-3 min-h-[280px]">
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-xs font-semibold text-slate-700">Company *</Label>
                  <Input
                    id="company"
                    placeholder="Company Name"
                    className="h-9 text-sm"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle" className="text-xs font-semibold text-slate-700">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Job Title (Optional)"
                    className="h-9 text-sm"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Course Details */}
            {currentStep === 3 && (
              <div className="space-y-3 min-h-[280px]">
                <div className="space-y-1.5">
                  <Label htmlFor="schedulePreference" className="text-xs font-semibold text-slate-700">Choose a date and location</Label>
                  {loadingSchedules ? (
                    <div className="h-9 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 flex items-center">
                      Loading schedules...
                    </div>
                  ) : (
                    <Select value={formData.schedulePreference} onValueChange={(value) => setFormData({ ...formData, schedulePreference: value })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Choose a date and location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible with dates</SelectItem>
                        <SelectItem value="specific">I have specific dates in mind</SelectItem>
                        {schedules.length > 0 && (
                          <>
                            {schedules.map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.scheduleId}>
                                {formatScheduleDate(schedule.startDate, schedule.endDate, schedule.venue)}
                                {schedule.price > 0 && ` - $${schedule.price.toLocaleString()}`}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {!loadingSchedules && schedules.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No upcoming schedules available for this course</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="participants" className="text-xs font-semibold text-slate-700">Number of Participants</Label>
                  <Select value={formData.participants} onValueChange={(value) => setFormData({ ...formData, participants: value })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+'].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 1 ? '1 Participant' : num === '10+' ? '10+ Participants' : `${num} Participants`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-semibold text-slate-700">Additional Requirements (Optional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Dietary requirements, accessibility needs, etc."
                    className="resize-none text-sm"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-3 border-t mt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
                size="sm"
                disabled={!isStepValid() || isSubmitting}
              >
                {currentStep === steps.length ? (
                  isSubmitting ? 'Submitting...' : 'Submit Enquiry'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
