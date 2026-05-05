'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Briefcase, 
  Users, 
  Globe, 
  Award, 
  TrendingUp, 
  CheckCircle2,
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRIES,
} from '@/lib/phone-country-codes'

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    telephone: '',
    telephoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    mobile: '',
    mobileCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    email: '',
    nationality: '',
    presentAddress: '',
    areaOfExpertise: '',
    message: '',
    cvFile: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [fileName, setFileName] = useState('No file chosen')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, cvFile: 'Please upload a PDF or Word document' }))
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cvFile: 'File size must be less than 5MB' }))
        return
      }
      setFormData(prev => ({ ...prev, cvFile: file }))
      setFileName(file.name)
      setErrors(prev => ({ ...prev, cvFile: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone is required'
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required'
    }
    if (!formData.presentAddress.trim()) {
      newErrors.presentAddress = 'Present address is required'
    }
    if (!formData.areaOfExpertise.trim()) {
      newErrors.areaOfExpertise = 'Area of expertise is required'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    if (!formData.cvFile) {
      newErrors.cvFile = 'Please attach your CV'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('dateOfBirth', formData.dateOfBirth)
      formDataToSend.append('telephone', formData.telephone)
      formDataToSend.append('telephoneCountryCode', formData.telephoneCountryCode)
      formDataToSend.append('mobile', formData.mobile)
      formDataToSend.append('mobileCountryCode', formData.mobileCountryCode)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('nationality', formData.nationality)
      formDataToSend.append('presentAddress', formData.presentAddress)
      formDataToSend.append('areaOfExpertise', formData.areaOfExpertise)
      formDataToSend.append('message', formData.message)
      if (formData.cvFile) {
        formDataToSend.append('cvFile', formData.cvFile)
      }

      const response = await fetch('/api/forms/careers', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }

      setSubmitSuccess(true)
      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        telephone: '',
        telephoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
        mobile: '',
        mobileCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
        email: '',
        nationality: '',
        presentAddress: '',
        areaOfExpertise: '',
        message: '',
        cvFile: null,
      })
      setFileName('No file chosen')
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const countryCodes = PHONE_COUNTRIES.map((country) => ({
    ...country,
    country: country.name,
  }))

  const getFlagImageUrl = (isoCode: string): string => {
    return `https://flagcdn.com/w40/${isoCode}.png`
  }

  // Helper function to get country by code
  const getCountryByCode = (code: string) => {
    return countryCodes.find(c => c.code === code) || countryCodes[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              International Freelance Training Consultants
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join our network of expert trainers and consultants. Share your expertise, grow your career, and make a global impact.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Why Join Our Network?
            </h2>
            <p className="text-lg text-slate-700 mb-4 leading-relaxed">
              We are looking for experienced training consultants and subject matter experts to join our international network. 
              As a freelance consultant with us, you'll have the opportunity to deliver world-class training programs across 
              various industries and locations.
            </p>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Our consultants enjoy flexible schedules, competitive compensation, and the chance to work with leading 
              organizations worldwide. Whether you specialize in management, technical training, or professional development, 
              we have opportunities that match your expertise.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A3049] shrink-0" />
                <span className="text-slate-700 font-medium">Global Opportunities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A3049] shrink-0" />
                <span className="text-slate-700 font-medium">Flexible Schedule</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A3049] shrink-0" />
                <span className="text-slate-700 font-medium">Competitive Rates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A3049] shrink-0" />
                <span className="text-slate-700 font-medium">Professional Growth</span>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/training-consultant.jpg"
              alt="Training Consultant"
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if image doesn't exist
                e.currentTarget.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
              }}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#0A3049]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-[#0A3049]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Global Reach</h3>
                <p className="text-slate-600">Work with clients across multiple countries and cultures</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#0A3049]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-[#0A3049]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Expert Network</h3>
                <p className="text-slate-600">Join a community of industry-leading professionals</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#0A3049]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-[#0A3049]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Career Growth</h3>
                <p className="text-slate-600">Continuous learning and professional development opportunities</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#0A3049]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#0A3049]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Support System</h3>
                <p className="text-slate-600">Dedicated support team to help you succeed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Details Form Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Career Details</h2>
            <p className="text-lg text-slate-600">
              Fill out the form below to apply for our freelance training consultant positions
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-medium">Thank you! Your application has been submitted successfully. We'll get back to you soon.</p>
              </div>
            </div>
          )}

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">
                      Your Full Name (as detailed in your passport) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Full Name"
                      className="h-12"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-base font-semibold">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        placeholder="dd-mm-yyyy"
                        className="h-12 pr-12"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                  </div>

                  {/* Telephone */}
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-base font-semibold">
                      Telephone <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.telephoneCountryCode}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, telephoneCountryCode: value }))}
                      >
                        <SelectTrigger className="h-12 w-[100px] border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0A3049]">
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image
                                src={getFlagImageUrl(getCountryByCode(formData.telephoneCountryCode).iso)}
                                alt={getCountryByCode(formData.telephoneCountryCode).country}
                                fill
                                className="object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{formData.telephoneCountryCode}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countryCodes.map((cc) => (
                            <SelectItem key={`${cc.code}-${cc.iso}`} value={cc.code}>
                              <div className="flex items-center gap-2">
                                <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                  <Image
                                    src={getFlagImageUrl(cc.iso)}
                                    alt={cc.country}
                                    fill
                                    className="object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                </div>
                                <span className="text-sm">{cc.country}</span>
                                <span className="text-xs text-gray-500 ml-auto">{cc.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        placeholder="Telephone Number"
                        className="h-12 flex-1"
                        required
                        value={formData.telephone}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-base font-semibold">
                      Mobile <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.mobileCountryCode}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mobileCountryCode: value }))}
                      >
                        <SelectTrigger className="h-12 w-[100px] border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0A3049]">
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                              <Image
                                src={getFlagImageUrl(getCountryByCode(formData.mobileCountryCode).iso)}
                                alt={getCountryByCode(formData.mobileCountryCode).country}
                                fill
                                className="object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{formData.mobileCountryCode}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countryCodes.map((cc) => (
                            <SelectItem key={`${cc.code}-${cc.iso}`} value={cc.code}>
                              <div className="flex items-center gap-2">
                                <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                  <Image
                                    src={getFlagImageUrl(cc.iso)}
                                    alt={cc.country}
                                    fill
                                    className="object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                </div>
                                <span className="text-sm">{cc.country}</span>
                                <span className="text-xs text-gray-500 ml-auto">{cc.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="Mobile Number"
                        className="h-12 flex-1"
                        required
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Your Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Id"
                      className="h-12"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-base font-semibold">
                      Your Nationality <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      placeholder="Nationality"
                      className="h-12"
                      required
                      value={formData.nationality}
                      onChange={handleInputChange}
                    />
                    {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
                  </div>

                  {/* Present Address */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="presentAddress" className="text-base font-semibold">
                      Present Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="presentAddress"
                      name="presentAddress"
                      placeholder="Present Address"
                      className="h-12"
                      required
                      value={formData.presentAddress}
                      onChange={handleInputChange}
                    />
                    {errors.presentAddress && <p className="text-sm text-red-500">{errors.presentAddress}</p>}
                  </div>

                  {/* Area of Expertise */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="areaOfExpertise" className="text-base font-semibold">
                      Area of Expertise (Administration, Finance, etc) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="areaOfExpertise"
                      name="areaOfExpertise"
                      placeholder="Area of Expertise"
                      className="h-12"
                      required
                      value={formData.areaOfExpertise}
                      onChange={handleInputChange}
                    />
                    {errors.areaOfExpertise && <p className="text-sm text-red-500">{errors.areaOfExpertise}</p>}
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="message" className="text-base font-semibold">
                      Your Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Message"
                      rows={6}
                      className="resize-none"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>

                  {/* Attach CV */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="cvFile" className="text-base font-semibold">
                      Attach CV <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <input
                        id="cvFile"
                        name="cvFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-6 border-slate-300 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          const fileInput = document.getElementById('cvFile') as HTMLInputElement
                          if (fileInput) {
                            fileInput.click()
                          }
                        }}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </Button>
                      <span className="text-slate-600">{fileName}</span>
                    </div>
                    {errors.cvFile && <p className="text-sm text-red-500">{errors.cvFile}</p>}
                    <p className="text-sm text-slate-500">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#0A3049] to-[#0A3049] hover:from-[#0a3d5c] hover:to-[#0a3d5c] font-semibold h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

