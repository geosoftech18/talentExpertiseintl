'use client'

import { useState } from 'react'
import { X, Download } from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface DownloadBrochureFormProps {
  course: Course
  onClose: () => void
}

export function DownloadBrochureForm({ course, onClose }: DownloadBrochureFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading } = useRequireAuth()
  
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
    name: '',
    email: '',
    phone: '',
    countryCode: '+971'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/forms/brochure-download', {
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
        throw new Error(result.error || 'Failed to submit download request')
      }

      alert('Thank you! Your brochure download request has been submitted successfully.')
      onClose()
    } catch (error) {
      console.error('Error submitting brochure download:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <Card className="w-full max-w-md my-8 animate-slide-up shadow-2xl">
        <CardHeader className="relative border-b bg-gradient-to-r from-slate-50 to-white pb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 hover:bg-slate-200 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Download Brochure</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Get the course details</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <p className="text-slate-600 mb-6 text-sm">
            Please provide your basic details to download the course brochure.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                className="h-12"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="h-12"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">Phone Number *</Label>
              <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                >
                  <SelectTrigger className="w-auto min-w-[100px] h-12 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                        <Image
                          src={getFlagImageUrl(formData.countryCode)}
                          alt={countries.find(c => c.code === formData.countryCode)?.name || "Country flag"}
                          fill
                          className="object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
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
                  id="phone"
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  className="h-12 border-0 rounded-none focus-visible:ring-0 flex-1"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const phoneValue = e.target.value
                    const detectedCode = detectCountryCode(phoneValue, formData.countryCode)
                    if (detectedCode) {
                      setFormData({ ...formData, phone: phoneValue, countryCode: detectedCode })
                    } else {
                      setFormData({ ...formData, phone: phoneValue })
                    }
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold h-12"
                size="lg"
                disabled={isSubmitting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Download Brochure'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                size="lg"
                className="px-6 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
