'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course, CourseSchedule } from '@/lib/supabase'
import { format } from 'date-fns'

// Map phone country codes to ISO country codes for flags
const getCountryISO = (phoneCode: string): string => {
  const codeMap: { [key: string]: string } = {
    "+971": "ae", "+1": "us", "+44": "gb", "+65": "sg", "+966": "sa", "+974": "qa",
    "+968": "om", "+965": "kw", "+973": "bh", "+91": "in", "+86": "cn", "+81": "jp",
    "+49": "de", "+33": "fr", "+39": "it", "+34": "es", "+61": "au", "+27": "za",
    "+234": "ng", "+254": "ke", "+20": "eg", "+60": "my", "+66": "th", "+62": "id",
    "+84": "vn", "+82": "kr",
  }
  return codeMap[phoneCode] || "xx"
}

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

const detectCountryCode = (phoneNumber: string, currentCountryCode: string = '+971'): string => {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return currentCountryCode
  }

  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('+')) {
    const sortedCountries = [...countries].sort((a, b) => {
      const aCode = a.code.replace('+', '')
      const bCode = b.code.replace('+', '')
      return bCode.length - aCode.length
    })
    for (const country of sortedCountries) {
      const codeDigits = country.code.replace('+', '')
      if (cleaned === '+' + codeDigits || cleaned.startsWith('+' + codeDigits)) {
        return country.code
      }
    }
  }
  
  let digitsOnly = cleaned.replace(/^\+/, '').replace(/^0+/, '')
  if (!digitsOnly || digitsOnly.length === 0) {
    return currentCountryCode
  }
  
  const patterns: { [key: string]: { startDigits: string[], length: number } } = {
    '+971': { startDigits: ['50', '52', '54', '55', '56', '58'], length: 9 },
    '+966': { startDigits: ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'], length: 9 },
    '+91': { startDigits: ['6', '7', '8', '9'], length: 10 },
    '+44': { startDigits: ['7'], length: 10 },
    '+65': { startDigits: ['8', '9'], length: 8 },
    '+974': { startDigits: ['3', '5', '6', '7'], length: 8 },
    '+968': { startDigits: ['9'], length: 8 },
    '+973': { startDigits: ['3', '6'], length: 8 },
    '+965': { startDigits: ['5', '6', '9'], length: 8 },
    '+1': { startDigits: [], length: 10 },
  }
  
  for (const [countryCode, pattern] of Object.entries(patterns)) {
    if (pattern.startDigits.length === 0) {
      if (digitsOnly.length === pattern.length) {
        return countryCode
      }
      continue
    }
    
    const matchesStart = pattern.startDigits.some(start => digitsOnly.startsWith(start))
    if (matchesStart) {
      if (digitsOnly.length === pattern.length) {
        return countryCode
      }
      if (digitsOnly.length >= pattern.length - 2 && digitsOnly.length <= pattern.length + 1) {
        return countryCode
      }
      if (digitsOnly.length >= 3 && digitsOnly.length < pattern.length) {
        return countryCode
      }
    }
  }
  
  return currentCountryCode
}

interface CourseRegistrationFormProps {
  course: Course
  schedules: CourseSchedule[]
  selectedScheduleId?: string | null
  onClose: () => void
}

export function CourseRegistrationForm({ course, schedules, selectedScheduleId, onClose }: CourseRegistrationFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
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
    scheduleId: selectedScheduleId || '',
    title: '',
    name: '',
    email: '',
    designation: '',
    company: '',
    address: '',
    city: '',
    country: '',
    telephone: '',
    telephoneCountryCode: '+971',
    mobile: '',
    mobileCountryCode: '+971',
    paymentMethod: '',
    differentBilling: false,
    acceptTerms: false,
    captcha: ''
  })

  // Update scheduleId when selectedScheduleId prop changes
  useEffect(() => {
    if (selectedScheduleId) {
      setFormData(prev => ({ ...prev, scheduleId: selectedScheduleId }))
    }
  }, [selectedScheduleId])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.scheduleId.trim()) {
        newErrors.scheduleId = 'Please select a schedule'
      }
      if (!formData.title.trim()) {
        newErrors.title = 'Please select a title'
      }
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    if (stepNumber === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required'
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required'
      }
      if (!formData.country.trim()) {
        newErrors.country = 'Please select a country'
      }
      if (!formData.telephone.trim()) {
        newErrors.telephone = 'Telephone number is required'
      }
      if (!formData.paymentMethod.trim()) {
        newErrors.paymentMethod = 'Please select a payment method'
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions'
      }
      if (!formData.captcha.trim()) {
        newErrors.captcha = 'Please complete CAPTCHA verification'
      } else if (formData.captcha.trim() !== '386') {
        newErrors.captcha = 'CAPTCHA verification failed'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps before submission
    const isStep1Valid = validateStep(1)
    const isStep2Valid = validateStep(2)
    
    if (!isStep1Valid || !isStep2Valid) {
      // If step 1 has errors, go back to step 1
      if (!isStep1Valid) {
        setStep(1)
      }
      return
    }

    // All validations passed - submit to API
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const selectedSchedule = schedules.find(s => s.id === formData.scheduleId)
      
      const response = await fetch('/api/forms/course-registration', {
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
        throw new Error(result.error || 'Failed to submit registration')
      }

      // Show appropriate message based on payment method
      if (formData.paymentMethod === 'invoice') {
        alert(`✅ Invoice request submitted successfully!\n\nYour request will be reviewed by our team. Once approved, an order will be created and you will receive an invoice via email.`)
      } else {
        alert('Thank you! Your registration has been submitted successfully.')
      }
      onClose()
    } catch (error) {
      console.error('Error submitting registration:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 2) setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      // Clear errors when going back
      setErrors({})
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.scheduleId.trim() && 
             formData.title.trim() && 
             formData.name.trim() && 
             formData.email.trim() &&
             validateEmail(formData.email)
    }
    if (step === 2) {
      return formData.address.trim() &&
             formData.city.trim() &&
             formData.country.trim() &&
             formData.telephone.trim() &&
             formData.paymentMethod.trim() &&
             formData.acceptTerms &&
             formData.captcha.trim() === '386'
    }
    return true
  }

  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[95vh] flex flex-col animate-slide-up shadow-2xl overflow-hidden">
        <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-white pb-3 pt-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 hover:bg-slate-200 rounded-full h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900">Course Registration</CardTitle>
            </div>
            
            {/* Course Info - Compact */}
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Course:</span>
                <p className="text-xs font-medium text-slate-900 leading-tight line-clamp-1">{course.title}</p>
              </div>
              {course.course_code && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Code:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-mono text-xs h-5 px-2">
                    {course.course_code}
                  </Badge>
                </div>
              )}
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mt-3 mb-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </div>
              <div className={`h-1 w-12 rounded transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {step === 1 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col">
                <div className="space-y-1.5">
                  <Label htmlFor="schedule" className="text-xs font-semibold text-slate-700">Select Schedule *</Label>
                  <Select value={formData.scheduleId} onValueChange={(value) => handleFieldChange('scheduleId', value)}>
                    <SelectTrigger className={`h-9 text-sm ${errors.scheduleId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select Schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => {
                        const startDate = schedule.start_date ? new Date(schedule.start_date) : new Date()
                        const endDate = schedule.end_date ? new Date(schedule.end_date) : startDate
                        const city = schedule.city || schedule.venue?.split(',')[0] || 'TBA'
                        const country = schedule.country || schedule.venue?.split(',')[1]?.trim() || 'TBA'
                        const fees = schedule.fees || schedule.price || 0
                        
                        return (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')} | {city}, {country} | ${fees.toLocaleString()}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {errors.scheduleId && <p className="text-xs text-red-600 mt-1">{errors.scheduleId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Title *</Label>
                    <Select value={formData.title} onValueChange={(value) => handleFieldChange('title', value)}>
                      <SelectTrigger className={`h-9 text-sm ${errors.title ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select Title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mr">Mr.</SelectItem>
                        <SelectItem value="mrs">Mrs.</SelectItem>
                        <SelectItem value="ms">Ms.</SelectItem>
                        <SelectItem value="dr">Dr.</SelectItem>
                        <SelectItem value="prof">Prof.</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Name*"
                      className={`h-9 text-sm ${errors.name ? 'border-red-500' : ''}`}
                      required
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email*"
                    className={`h-9 text-sm ${errors.email ? 'border-red-500' : ''}`}
                    required
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="designation" className="text-xs font-semibold text-slate-700">Designation/Position</Label>
                    <Input
                      id="designation"
                      placeholder="Designation/Position"
                      className="h-9 text-sm"
                      value={formData.designation}
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs font-semibold text-slate-700">Company</Label>
                    <Input
                      id="company"
                      placeholder="Company"
                      className="h-9 text-sm"
                      value={formData.company}
                      onChange={(e) => handleFieldChange('company', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-slate-700">Address</Label>
                  <Input
                    id="address"
                    placeholder="Address*"
                    className={`h-9 text-sm ${errors.address ? 'border-red-500' : ''}`}
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City</Label>
                    <Input
                      id="city"
                      placeholder="City*"
                      className={`h-9 text-sm ${errors.city ? 'border-red-500' : ''}`}
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                    />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-semibold text-slate-700">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                      <SelectTrigger className={`h-9 text-sm ${errors.country ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="ae">United Arab Emirates</SelectItem>
                        <SelectItem value="sa">Saudi Arabia</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="telephone" className="text-xs font-semibold text-slate-700">Telephone No.</Label>
                    <div className={`flex border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${errors.telephone ? 'border-red-500' : 'border-slate-300'}`}>
                      <Select
                        value={formData.telephoneCountryCode}
                        onValueChange={(value) => handleFieldChange('telephoneCountryCode', value)}
                      >
                        <SelectTrigger className="w-auto min-w-[100px] h-9 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image
                                src={getFlagImageUrl(formData.telephoneCountryCode)}
                                alt={countries.find(c => c.code === formData.telephoneCountryCode)?.name || "Country flag"}
                                fill
                                className="object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{formData.telephoneCountryCode}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2">
                                <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                  <Image src={getFlagImageUrl(country.code)} alt={country.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                </div>
                                <span className="text-sm">{country.name}</span>
                                <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="Telephone No.*"
                        className={`h-9 text-sm border-0 rounded-none focus-visible:ring-0 flex-1`}
                        value={formData.telephone}
                        onChange={(e) => {
                          const phoneValue = e.target.value
                          const detectedCode = detectCountryCode(phoneValue, formData.telephoneCountryCode)
                          handleFieldChange('telephoneCountryCode', detectedCode)
                          handleFieldChange('telephone', phoneValue)
                        }}
                      />
                    </div>
                    {errors.telephone && <p className="text-xs text-red-600 mt-1">{errors.telephone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mobile" className="text-xs font-semibold text-slate-700">Mobile No.</Label>
                    <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                      <Select
                        value={formData.mobileCountryCode}
                        onValueChange={(value) => handleFieldChange('mobileCountryCode', value)}
                      >
                        <SelectTrigger className="w-auto min-w-[100px] h-9 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image
                                src={getFlagImageUrl(formData.mobileCountryCode)}
                                alt={countries.find(c => c.code === formData.mobileCountryCode)?.name || "Country flag"}
                                fill
                                className="object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{formData.mobileCountryCode}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2">
                                <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                  <Image src={getFlagImageUrl(country.code)} alt={country.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                </div>
                                <span className="text-sm">{country.name}</span>
                                <span className="text-xs text-slate-500 ml-auto">{country.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Mobile No."
                        className="h-9 text-sm border-0 rounded-none focus-visible:ring-0 flex-1"
                        value={formData.mobile}
                        onChange={(e) => {
                          const phoneValue = e.target.value
                          const detectedCode = detectCountryCode(phoneValue, formData.mobileCountryCode)
                          handleFieldChange('mobileCountryCode', detectedCode)
                          handleFieldChange('mobile', phoneValue)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payment" className="text-xs font-semibold text-slate-700">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleFieldChange('paymentMethod', value)}>
                    <SelectTrigger className={`h-9 text-sm ${errors.paymentMethod ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="invoice">Pay via Invoice</SelectItem>
                      <SelectItem value="purchase">Purchase Order</SelectItem>
                    </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="billing"
                      className='border border-blue-600'
                      checked={formData.differentBilling}
                      onCheckedChange={(checked) => handleFieldChange('differentBilling', checked as boolean)}
                    />
                    <label
                      htmlFor="billing"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Different Billing Details
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      className={`mt-0.5 border border-blue-600 ${errors.acceptTerms ? 'border-red-500' : ''}`}
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleFieldChange('acceptTerms', checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I accept the <span className="text-red-600 cursor-pointer hover:underline">Terms & Conditions</span> and <span className="text-red-600 cursor-pointer hover:underline">Cancellation Policy</span> *
                    </label>
                  </div>
                  {errors.acceptTerms && <p className="text-xs text-red-600 -mt-2 ml-7">{errors.acceptTerms}</p>}

                  <div className="space-y-1.5">
                    <Label htmlFor="captcha" className="text-xs font-semibold text-slate-700">CAPTCHA Verification</Label>
                    <div className="flex gap-3 items-center">
                      <div className="bg-slate-100 border-2 border-slate-300 px-3 py-2 rounded text-xl font-bold tracking-wider text-slate-700 select-none">
                        3 8 6
                      </div>
                      <Button type="button" variant="outline" size="icon" className="shrink-0 h-9 w-9">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      id="captcha"
                      placeholder="Enter CAPTCHA"
                      className={`h-9 text-sm mt-2 ${errors.captcha ? 'border-red-500' : ''}`}
                      value={formData.captcha}
                      onChange={(e) => handleFieldChange('captcha', e.target.value)}
                    />
                    {errors.captcha && <p className="text-xs text-red-600 mt-1">{errors.captcha}</p>}
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
            <div className="flex gap-2 pt-3 border-t mt-3 flex-shrink-0">
              {step > 1 && (
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
                type={step === 2 ? 'submit' : 'button'}
                onClick={step === 2 ? undefined : nextStep}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                {step === 2 ? (
                  isSubmitting ? 'Submitting...' : 'Submit Registration'
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
