"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
// Map phone country codes to ISO country codes for flags
const getCountryISO = (phoneCode: string): string => {
  const codeMap: { [key: string]: string } = {
    "+971": "ae", "+1": "us", "+44": "gb", "+65": "sg", "+966": "sa", "+974": "qa",
    "+968": "om", "+965": "kw", "+973": "bh", "+91": "in", "+86": "cn", "+81": "jp",
    "+49": "de", "+33": "fr", "+39": "it", "+34": "es", "+31": "nl", "+41": "ch",
    "+61": "au", "+1340": "vi", "+688": "tv", "+256": "ug", "+380": "ua",
  }
  return codeMap[phoneCode] || "xx"
}

const getFlagImageUrl = (phoneCode: string): string => {
  const isoCode = getCountryISO(phoneCode)
  return `https://flagcdn.com/w40/${isoCode}.png`
}

import {
  Send,
  Phone,
  Mail,
  Clock,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Globe,
  Calendar,
  Star,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Download,
  PlayCircle,
  MessageCircle,
} from "lucide-react"

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
  { code: "+1340", name: "U.S. Virgin Islands", iso: "vi" },
  { code: "+688", name: "Tuvalu", iso: "tv" },
  { code: "+256", name: "Uganda", iso: "ug" },
  { code: "+380", name: "Ukraine", iso: "ua" },
  { code: "+91", name: "India", iso: "in" },
  { code: "+86", name: "China", iso: "cn" },
  { code: "+81", name: "Japan", iso: "jp" },
  { code: "+49", name: "Germany", iso: "de" },
  { code: "+33", name: "France", iso: "fr" },
  { code: "+39", name: "Italy", iso: "it" },
  { code: "+34", name: "Spain", iso: "es" },
  { code: "+31", name: "Netherlands", iso: "nl" },
  { code: "+41", name: "Switzerland", iso: "ch" },
  { code: "+61", name: "Australia", iso: "au" },
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

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with our training consultants",
    value: "+971-4-5473010",
    action: "Call Now",
    color: "text-green-600",
    bgColor: "bg-green-50",
    link: "tel:+971-4-5473010",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Get detailed course information",
    value: "info@talentexpertiseintl.com",
    action: "Send Email",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    link: "mailto:info@talentexpertiseintl.com",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Instant support available",
    value: "Chat with Expert",
    action: "Start Chat",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    link: "https://wa.me/+971561792284",
  },
  {
    icon: Calendar,
    title: "Book Consultation",
    description: "Free 30-minute consultation",
    value: "Schedule Meeting",
    action: "Book Now",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    link: "/contact",
  },
]

// const quickActions = [
//   {
//     icon: Download,
//     title: "Course Catalog",
//     description: "Download our complete training catalog",
//     action: "Download PDF",
//     gradient: "from-blue-600 to-cyan-600",
//   },
//   {
//     icon: PlayCircle,
//     title: "Virtual Tour",
//     description: "Take a virtual tour of our facilities",
//     action: "Start Tour",
//     gradient: "from-purple-600 to-pink-600",
//   },
//   {
//     icon: Star,
//     title: "Success Stories",
//     description: "Read testimonials from our graduates",
//     action: "View Stories",
//     gradient: "from-green-600 to-teal-600",
//   },
//   {
//     icon: Globe,
//     title: "Global Locations",
//     description: "Find training centers near you",
//     action: "View Locations",
//     gradient: "from-orange-600 to-red-600",
//   },
// ]

const benefits = [
  "Expert-led training programs",
  "Globally recognized certifications",
  "Flexible learning options",
  "24/7 support available",
  "Money-back guarantee",
  "Corporate training solutions",
]

export default function CTASection() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+971",
    message: "",
    interestedIn: "",
    company: "",
    jobTitle: "",
    trainingBudget: "",
    preferredDate: "",
    marketingConsent: false,
    privacyConsent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset step when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      setCurrentStep(1)
    }
  }, [isSubmitted])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitted(true)
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "+1",
        message: "",
        interestedIn: "",
        company: "",
        jobTitle: "",
        trainingBudget: "",
        preferredDate: "",
        marketingConsent: false,
        privacyConsent: false,
      })
    }, 3000)
  }

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.message &&
      formData.privacyConsent
    )
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone
      case 2:
        return true // Optional fields
      case 3:
        return formData.message && formData.privacyConsent
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const totalSteps = 3

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-[#6F4E25]/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#6F4E25]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#0A3049]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A3049] mr-2 sm:mr-3" />
            <Badge variant="outline" className="border-[#0A3049]/30 text-[#0A3049] bg-[#0A3049]/10 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
              Get Started Today
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0A3049] mb-4 sm:mb-6 px-4">
            Ready to{" "}
            <span className="bg-gradient-to-r from-[#0A3049] to-[#6F4E25] bg-clip-text text-transparent">
              Transform
            </span>{" "}
            Your Career?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
            Join thousands of professionals who have advanced their careers with our world-class training programs. Take
            the first step towards your professional transformation today.
          </p>
        </div>

        {/* Main CTA Content */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start mb-8 sm:mb-12 lg:mb-16">
          {/* Left Side - Image and Benefits */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Training Image */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/CTA-image.jpg"
                alt="Professional training session with diverse team"
                className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Transform Your Future</h3>
                <p className="text-sm sm:text-base text-white/90">Join thousands of professionals advancing their careers</p>
              </div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  15,000+ Graduates
                </Badge>
              </div>
            </div>

            {/* Benefits List */}
            <Card className="border-2 border-[#6F4E25]/20 bg-gradient-to-br from-white to-[#6F4E25]/5">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-[#0A3049] text-base sm:text-lg lg:text-xl">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Why Choose Talent Expertise International?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <div className="space-y-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <div
                    key={index}
                    className="group cursor-pointer hover:bg-purple-50 transition-all duration-300 p-3 rounded-lg border border-gray-200 hover:border-purple-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${action.gradient} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{action.title}</h4>
                          <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-gray-600 truncate">{action.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div> */}
          </div>

          {/* Right Side - Contact Form */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            <Card className="border-2 border-[#0A3049]/20 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-[#0A3049] mb-2">Get Your Free Consultation</CardTitle>
                <p className="text-sm sm:text-base text-gray-600">
                  Fill out the form below and our training experts will contact you within 24 hours
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Multi-step Progress Indicator - Mobile Only */}
                    {isMobile && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          {Array.from({ length: totalSteps }, (_, index) => (
                            <div key={index} className="flex items-center flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  currentStep > index + 1
                                    ? "bg-green-500 text-white"
                                    : currentStep === index + 1
                                    ? "bg-[#0A3049] text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {currentStep > index + 1 ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              {index < totalSteps - 1 && (
                                <div
                                  className={`flex-1 h-1 mx-1 ${
                                    currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span className={currentStep === 1 ? "font-semibold text-[#0A3049]" : ""}>Personal Info</span>
                          <span className={currentStep === 2 ? "font-semibold text-[#0A3049]" : ""}>Professional</span>
                          <span className={currentStep === 3 ? "font-semibold text-[#0A3049]" : ""}>Message</span>
                        </div>
                      </div>
                    )}
                    {/* Step 1: Personal Information - Show on desktop always, or on mobile when step 1 */}
                    {(!isMobile || currentStep === 1) && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium text-gray-700">
                              First Name *
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              placeholder="Enter Your First Name"
                              className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium text-gray-700">
                              Last Name *
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              placeholder="Enter Your Last Name"
                              className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11"
                              required
                            />
                          </div>
                        </div>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="Enter Your Email"
                              className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-700">
                              Phone *
                            </Label>
                            <div className="flex border-2 border-gray-200 focus-within:border-[#0A3049] rounded-md overflow-hidden">
                              <Select
                                value={formData.countryCode}
                                onValueChange={(value) => handleInputChange("countryCode", value)}
                              >
                                <SelectTrigger className="w-auto min-w-[90px] sm:min-w-[100px] border-0 rounded-none border-r-2 border-gray-200 bg-transparent focus:ring-0 px-1.5 sm:px-2 h-10 sm:h-11">
                                  <div className="flex items-center gap-1 sm:gap-1.5">
                                    <div className="relative w-4 h-3 sm:w-5 sm:h-4 rounded-sm overflow-hidden shrink-0">
                                      <Image
                                        src={getFlagImageUrl(formData.countryCode)}
                                        alt={countries.find(c => c.code === formData.countryCode)?.name || "Country flag"}
                                        fill
                                        className="object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-medium text-gray-700">{formData.countryCode}</span>
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
                                        <span className="text-xs text-gray-500 ml-auto">{country.code}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                  const phoneValue = e.target.value
                                  const detectedCode = detectCountryCode(phoneValue, formData.countryCode)
                                  if (detectedCode) {
                                    handleInputChange("countryCode", detectedCode)
                                  }
                                  handleInputChange("phone", phoneValue)
                                }}
                                placeholder="Enter Your Phone"
                                className="border-0 rounded-none border-l-0 focus-visible:ring-0 flex-1 text-sm sm:text-base h-10 sm:h-11"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Professional Information - Show on desktop always, or on mobile when step 2 */}
                    {(!isMobile || currentStep === 2) && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Company and Job Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-xs sm:text-sm font-medium text-gray-700">
                              Company
                            </Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => handleInputChange("company", e.target.value)}
                              placeholder="Your Company"
                              className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jobTitle" className="text-xs sm:text-sm font-medium text-gray-700">
                              Job Title
                            </Label>
                            <Input
                              id="jobTitle"
                              value={formData.jobTitle}
                              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                              placeholder="Your Job Title"
                              className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11"
                            />
                          </div>
                        </div>

                        {/* Interest and Budget */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="interestedIn" className="text-xs sm:text-sm font-medium text-gray-700">
                              Interested In
                            </Label>
                            <Select
                              value={formData.interestedIn}
                              onValueChange={(value) => handleInputChange("interestedIn", value)}
                            >
                              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11">
                                <SelectValue placeholder="Select Training Area" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="leadership">Leadership & Management</SelectItem>
                                <SelectItem value="project">Project Management</SelectItem>
                                <SelectItem value="finance">Finance & Accounting</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                                <SelectItem value="it">Information Technology</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="oil-gas">Oil & Gas</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trainingBudget" className="text-xs sm:text-sm font-medium text-gray-700">
                              Training Budget
                            </Label>
                            <Select
                              value={formData.trainingBudget}
                              onValueChange={(value) => handleInputChange("trainingBudget", value)}
                            >
                              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0A3049] text-sm sm:text-base h-10 sm:h-11">
                                <SelectValue placeholder="Select Budget Range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-5k">Under $5,000</SelectItem>
                                <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                                <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                                <SelectItem value="over-50k">Over $50,000</SelectItem>
                                <SelectItem value="discuss">Prefer to Discuss</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Message and Consent - Show on desktop always, or on mobile when step 3 */}
                    {(!isMobile || currentStep === 3) && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Message */}
                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-xs sm:text-sm font-medium text-gray-700">
                            Message *
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => handleInputChange("message", e.target.value)}
                            placeholder="Enter Your Message"
                            rows={4}
                            className="border-2 border-gray-200 focus:border-[#0A3049] resize-none text-sm sm:text-base"
                            required
                          />
                        </div>

                        {/* Consent Checkboxes */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="marketingConsent"
                              checked={formData.marketingConsent}
                              onCheckedChange={(checked) => handleInputChange("marketingConsent", checked as boolean)}
                              className="border-2 border-gray-400 focus:border-[#0A3049]"
                            />
                            <Label htmlFor="marketingConsent" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              I would like to receive updates about training programs, industry insights, and special offers
                            </Label>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="privacyConsent"
                              checked={formData.privacyConsent}
                              onCheckedChange={(checked) => handleInputChange("privacyConsent", checked as boolean)}
                              required
                              className="border-2 border-gray-400 focus:border-[#0A3049]"
                            />
                            <Label htmlFor="privacyConsent" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              I agree to the{" "}
                              <a href="#" className="text-[#0A3049] hover:underline">
                                Privacy Policy
                              </a>{" "}
                              and{" "}
                              <a href="#" className="text-[#0A3049] hover:underline">
                                Terms of Service
                              </a>{" "}
                              *
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons - Mobile Only */}
                    {isMobile && (
                      <div className="flex justify-between gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 1}
                          className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                          Previous
                        </Button>
                        {currentStep < totalSteps ? (
                          <Button
                            type="button"
                            onClick={nextStep}
                            disabled={!isStepValid(currentStep)}
                            className="flex-1 bg-[#0A3049] text-white hover:bg-[#0A3049]/90 disabled:opacity-50 text-sm"
                          >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={!isFormValid() || isSubmitting}
                            className="flex-1 bg-[#0A3049] hover:bg-[#0A3049]/90 text-white disabled:opacity-50 text-sm"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Submit Button - Desktop Only */}
                    {!isMobile && (
                      <Button
                        type="submit"
                        disabled={!isFormValid() || isSubmitting}
                        className="w-full bg-[#0A3049] hover:bg-[#0A3049]/90 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0A3049] mb-3 sm:mb-4">Message Sent Successfully!</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                      Thank you for your interest. Our training consultants will contact you within 24 hours to discuss
                      your requirements.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>What's Next?</strong> We'll review your requirements and prepare a customized training
                        proposal for you.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A3049] text-center mb-6 sm:mb-8 px-4">Other Ways to Reach Us</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-purple-200"
                >
                  <CardContent className="p-1 sm:p-6 text-center ">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 ${method.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${method.color}`} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{method.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{method.description}</p>
                    <p className="font-semibold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">{method.value}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-2  ${method.color.replace("text-", "border-").replace("600", "200")} ${method.color} hover:${method.bgColor} hover:text-${method.color} text-xs sm:text-sm w-full sm:w-auto`}
                      onClick={() => window.open(method.link, '_blank')}
                    >
                      {method.action}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049]/90 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-24 translate-x-24 sm:-translate-y-32 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-y-18 -translate-x-18 sm:translate-y-24 sm:-translate-x-24"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12 sm:-translate-x-16 sm:-translate-y-16"></div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 mr-2 sm:mr-3" />
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">Limited Time Offer</Badge>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 px-4">Start Your Professional Journey Today</h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
              Book your consultation now and receive a complimentary career assessment worth $500. Transform your
              potential into success with our expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => router.push("/contact")}
                size="lg"
                className="bg-white text-[#0A3049] hover:bg-gray-100 font-semibold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Book Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl w-full sm:w-auto"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Call +971-4-5473010
              </Button>
            </div>
            <div className="flex flex-row items-center gap-4 justify-center mt-6 sm:mt-8 space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm opacity-80 px-4">
              <div className="flex items-center">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>24h Response</span>
              </div>
              <div className="flex items-center">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Money-back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
