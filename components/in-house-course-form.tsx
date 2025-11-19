'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Building2 } from 'lucide-react'
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

interface InHouseCourseFormProps {
  course: Course
  onClose: () => void
}

const steps = [
  { id: 1, title: 'Personal Info', description: 'Your details' },
  { id: 2, title: 'Course & Address', description: 'Training details' },
  { id: 3, title: 'Contact & Verify', description: 'Contact info' },
]

export function InHouseCourseForm({ course, onClose }: InHouseCourseFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  const [step, setStep] = useState(1)
  
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
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
    preferredDates: '',
    participants: '',
    location: '',
    message: '',
    captcha: ''
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
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
      if (!formData.company.trim()) {
        newErrors.company = 'Company is required'
      }
    }

    if (stepNumber === 2) {
      if (!formData.participants.trim()) {
        newErrors.participants = 'Number of participants is required'
      } else if (isNaN(Number(formData.participants)) || Number(formData.participants) < 1) {
        newErrors.participants = 'Please enter a valid number of participants'
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required'
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required'
      }
      if (!formData.country.trim()) {
        newErrors.country = 'Please select a country'
      }
    }

    if (stepNumber === 3) {
      if (!formData.telephone.trim()) {
        newErrors.telephone = 'Telephone number is required'
      }
      if (!formData.captcha.trim()) {
        newErrors.captcha = 'Please complete CAPTCHA verification'
      } else if (formData.captcha.trim() !== '649') {
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
    const isStep3Valid = validateStep(3)
    
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      // Go back to the first step with errors
      if (!isStep1Valid) setStep(1)
      else if (!isStep2Valid) setStep(2)
      else if (!isStep3Valid) setStep(3)
      return
    }

    // All validations passed - submit to API
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/forms/in-house-course', {
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
        throw new Error(result.error || 'Failed to submit request')
      }

      alert('Thank you! Your in-house course request has been submitted successfully.')
      onClose()
    } catch (error) {
      console.error('Error submitting in-house course request:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < steps.length) setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setErrors({})
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.title.trim() && 
             formData.name.trim() && 
             formData.email.trim() &&
             validateEmail(formData.email) &&
             formData.company.trim()
    }
    if (step === 2) {
      return formData.participants.trim() &&
             !isNaN(Number(formData.participants)) &&
             Number(formData.participants) >= 1 &&
             formData.address.trim() &&
             formData.city.trim() &&
             formData.country.trim()
    }
    if (step === 3) {
      return formData.telephone.trim() &&
             formData.captcha.trim() === '649'
    }
    return true
  }

  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[95vh] flex flex-col animate-slide-up shadow-2xl overflow-hidden">
        <CardHeader className="relative border-b bg-gradient-to-r from-slate-50 to-white pb-3 pt-4 flex-shrink-0">
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
              <Building2 className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-lg font-bold text-slate-900">Run this Course In-House</CardTitle>
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
            <div className="flex items-center justify-between mt-3 mb-2">
              {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        step > stepItem.id
                          ? 'bg-blue-600 text-white'
                          : step === stepItem.id
                          ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step > stepItem.id ? <Check className="w-4 h-4" /> : stepItem.id}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <div className="text-xs font-medium text-slate-900">{stepItem.title}</div>
                      <div className="text-xs text-slate-500">{stepItem.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step > stepItem.id ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col justify-center">
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
                    <Label htmlFor="company" className="text-xs font-semibold text-slate-700">Company *</Label>
                    <Input
                      id="company"
                      placeholder="Company"
                      className={`h-9 text-sm ${errors.company ? 'border-red-500' : ''}`}
                      required
                      value={formData.company}
                      onChange={(e) => handleFieldChange('company', e.target.value)}
                    />
                    {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Course Details & Address */}
            {step === 2 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col justify-center">
                <div className="space-y-1.5">
                  <Label htmlFor="participants" className="text-xs font-semibold text-slate-700">Expected Number of Participants *</Label>
                  <Input
                    id="participants"
                    type="number"
                    placeholder="Number of participants"
                    className={`h-9 text-sm ${errors.participants ? 'border-red-500' : ''}`}
                    required
                    min="1"
                    value={formData.participants}
                    onChange={(e) => handleFieldChange('participants', e.target.value)}
                  />
                  {errors.participants && <p className="text-xs text-red-600 mt-1">{errors.participants}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="preferredDates" className="text-xs font-semibold text-slate-700">Preferred Training Dates</Label>
                    <Input
                      id="preferredDates"
                      placeholder="e.g., March 2024 or Q2 2024"
                      className="h-9 text-sm"
                      value={formData.preferredDates}
                      onChange={(e) => handleFieldChange('preferredDates', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold text-slate-700">Preferred Training Location</Label>
                    <Input
                      id="location"
                      placeholder="City or Country"
                      className="h-9 text-sm"
                      value={formData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-slate-700">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Address*"
                    className={`h-9 text-sm ${errors.address ? 'border-red-500' : ''}`}
                    required
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City *</Label>
                    <Input
                      id="city"
                      placeholder="City*"
                      className={`h-9 text-sm ${errors.city ? 'border-red-500' : ''}`}
                      required
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
              </div>
            )}

            {/* Step 3: Contact & Verification */}
            {step === 3 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="telephone" className="text-xs font-semibold text-slate-700">Telephone No. *</Label>
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
                        className="h-9 text-sm border-0 rounded-none focus-visible:ring-0 flex-1"
                        required
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
                  <Label htmlFor="message" className="text-xs font-semibold text-slate-700">Message</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Message"
                    className="resize-none text-sm"
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="captcha" className="text-xs font-semibold text-slate-700">CAPTCHA Verification *</Label>
                  <div className="flex gap-3 items-center">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-slate-300 px-4 py-2 rounded text-xl font-bold tracking-wider text-slate-700 select-none">
                      6 4 9
                    </div>
                    <Button type="button" variant="outline" size="icon" className="shrink-0 h-9 w-9">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    id="captcha"
                    placeholder="Enter CAPTCHA"
                    className={`h-9 text-sm mt-2 ${errors.captcha ? 'border-red-500' : ''}`}
                    required
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
            <div className="flex gap-2 pt-3 border-t mt-4 flex-shrink-0">
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
                type={step === steps.length ? 'submit' : 'button'}
                onClick={step === steps.length ? undefined : nextStep}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                {step === steps.length ? (
                  isSubmitting ? 'Submitting...' : 'Submit Request'
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
