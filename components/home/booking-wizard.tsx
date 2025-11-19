"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Map phone country codes to ISO country codes for flags
const getCountryISO = (phoneCode: string): string => {
  const codeMap: { [key: string]: string } = {
    "+971": "ae", "+1": "us", "+44": "gb", "+65": "sg", "+966": "sa", "+974": "qa",
    "+968": "om", "+965": "kw", "+973": "bh", "+91": "in", "+86": "cn", "+81": "jp",
    "+49": "de", "+33": "fr", "+39": "it", "+34": "es", "+61": "au", "+27": "za",
    "+234": "ng", "+254": "ke", "+20": "eg", "+60": "my", "+66": "th", "+62": "id",
    "+84": "vn", "+82": "kr", "+31": "nl", "+41": "ch",
  }
  return codeMap[phoneCode] || "xx"
}

const getFlagImageUrl = (phoneCode: string): string => {
  const isoCode = getCountryISO(phoneCode)
  return `https://flagcdn.com/w40/${isoCode}.png`
}

const phoneCountries = [
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
    const sortedCountries = [...phoneCountries].sort((a, b) => {
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

import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Shield,
  Mail,
  Phone,
  Building,
  Globe,
  Lock,
  Check,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react"

interface BookingStep {
  id: number
  title: string
  description: string
  completed: boolean
}

interface BookingData {
  // Course info
  course: any
  // Personal info
  firstName: string
  lastName: string
  email: string
  phone: string
  phoneCountryCode?: string
  company: string
  jobTitle: string
  country: string
  // Payment info
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  billingAddress: string
  billingCity: string
  billingZip: string
  billingCountry: string
  // Additional options
  dietaryRequirements: string
  specialRequests: string
  marketingConsent: boolean
  termsAccepted: boolean
}

const steps: BookingStep[] = [
  { id: 1, title: "Course Details", description: "Review your selection", completed: false },
  { id: 2, title: "Personal Information", description: "Your contact details", completed: false },
  { id: 3, title: "Payment", description: "Secure payment processing", completed: false },
  { id: 4, title: "Confirmation", description: "Booking complete", completed: false },
]

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Netherlands",
  "Switzerland",
]

export default function BookingWizard({
  course,
  isOpen,
  onClose,
}: { course: any; isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    course,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+971",
    company: "",
    jobTitle: "",
    country: "",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    billingAddress: "",
    billingCity: "",
    billingZip: "",
    billingCountry: "",
    dietaryRequirements: "",
    specialRequests: "",
    marketingConsent: false,
    termsAccepted: false,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState("")

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const processPayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate booking reference
    const reference = `TEI-${Date.now().toString().slice(-6)}`
    setBookingReference(reference)
    setBookingComplete(true)
    setIsProcessing(false)
    nextStep()
  }

  const calculateTotal = () => {
    const basePrice = Number.parseFloat(course.price.replace("$", "").replace(",", ""))
    const tax = basePrice * 0.1 // 10% tax
    return {
      subtotal: basePrice,
      tax: tax,
      total: basePrice + tax,
    }
  }

  const pricing = calculateTotal()

  // Step 1: Course Details Review
  const CourseDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Course Selection</h2>
        <p className="text-gray-600">Please confirm the details of your chosen training course</p>
      </div>

      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <Badge className={`${course.color} text-white mb-3`}>{course.category}</Badge>
              <p className="text-gray-600 mb-4">{course.description}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-gray-900">{course.price}</div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {new Date(course.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">{course.time}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div className="text-sm text-gray-500">{course.duration}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Venue</div>
                  <div className="text-sm text-gray-500">{course.venue}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Available Seats</div>
                  <div className="text-sm text-gray-500">{course.seats} remaining</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                <span className="font-medium">{course.rating}</span>
                <span className="text-gray-500 ml-2">• Instructor: {course.instructor}</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Check className="w-4 h-4 mr-1" />
                Seats Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Full payment is required to secure your booking</li>
              <li>• Cancellation policy: 48 hours notice required for full refund</li>
              <li>• Course materials and refreshments are included</li>
              <li>• Certificate of completion will be provided</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Step 2: Personal Information
  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Please provide your contact details for booking confirmation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={bookingData.firstName}
            onChange={(e) => updateBookingData("firstName", e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={bookingData.lastName}
            onChange={(e) => updateBookingData("lastName", e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={bookingData.email}
            onChange={(e) => updateBookingData("email", e.target.value)}
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <Select
              value={bookingData.phoneCountryCode || "+971"}
              onValueChange={(value) => updateBookingData("phoneCountryCode", value)}
            >
              <SelectTrigger className="w-auto min-w-[100px] h-10 border-0 rounded-none border-r border-slate-300 bg-transparent focus:ring-0 px-2">
                <div className="flex items-center gap-1.5">
                  <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                    <Image
                      src={getFlagImageUrl(bookingData.phoneCountryCode || "+971")}
                      alt={phoneCountries.find(c => c.code === (bookingData.phoneCountryCode || "+971"))?.name || "Country flag"}
                      fill
                      className="object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{bookingData.phoneCountryCode || "+971"}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {phoneCountries.map((country) => (
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
              className="h-10 border-0 rounded-none focus-visible:ring-0 flex-1"
              required
              value={bookingData.phone}
              onChange={(e) => {
                const phoneValue = e.target.value
                const detectedCode = detectCountryCode(phoneValue, bookingData.phoneCountryCode || "+971")
                if (detectedCode) {
                  updateBookingData("phoneCountryCode", detectedCode)
                }
                updateBookingData("phone", phoneValue)
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={bookingData.company}
            onChange={(e) => updateBookingData("company", e.target.value)}
            placeholder="Your company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={bookingData.jobTitle}
            onChange={(e) => updateBookingData("jobTitle", e.target.value)}
            placeholder="Your job title"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="country">Country *</Label>
          <Select value={bookingData.country} onValueChange={(value) => updateBookingData("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Additional Requirements</h3>

        <div className="space-y-2">
          <Label htmlFor="dietary">Dietary Requirements</Label>
          <Input
            id="dietary"
            value={bookingData.dietaryRequirements}
            onChange={(e) => updateBookingData("dietaryRequirements", e.target.value)}
            placeholder="Any dietary restrictions or preferences"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special">Special Requests</Label>
          <Input
            id="special"
            value={bookingData.specialRequests}
            onChange={(e) => updateBookingData("specialRequests", e.target.value)}
            placeholder="Any special accommodations needed"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketing"
            checked={bookingData.marketingConsent}
            onCheckedChange={(checked) => updateBookingData("marketingConsent", checked)}
          />
          <Label htmlFor="marketing" className="text-sm">
            I would like to receive updates about future courses and training opportunities
          </Label>
        </div>
      </div>
    </div>
  )

  // Step 3: Payment
  const PaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h2>
        <p className="text-gray-600">Complete your booking with secure payment processing</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={bookingData.paymentMethod}
                onValueChange={(value) => updateBookingData("paymentMethod", value)}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                  <RadioGroupItem value="paypal" id="paypal" disabled />
                  <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                    <Globe className="w-4 h-4 mr-2" />
                    PayPal (Coming Soon)
                  </Label>
                </div>
              </RadioGroup>

              {bookingData.paymentMethod === "card" && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      value={bookingData.cardName}
                      onChange={(e) => updateBookingData("cardName", e.target.value)}
                      placeholder="Name as it appears on card"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={bookingData.cardNumber}
                      onChange={(e) => updateBookingData("cardNumber", e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date *</Label>
                      <Input
                        id="expiry"
                        value={bookingData.expiryDate}
                        onChange={(e) => updateBookingData("expiryDate", e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={bookingData.cvv}
                        onChange={(e) => updateBookingData("cvv", e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Address *</Label>
                <Input
                  id="billingAddress"
                  value={bookingData.billingAddress}
                  onChange={(e) => updateBookingData("billingAddress", e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City *</Label>
                  <Input
                    id="billingCity"
                    value={bookingData.billingCity}
                    onChange={(e) => updateBookingData("billingCity", e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingZip">ZIP/Postal Code *</Label>
                  <Input
                    id="billingZip"
                    value={bookingData.billingZip}
                    onChange={(e) => updateBookingData("billingZip", e.target.value)}
                    placeholder="ZIP/Postal Code"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country *</Label>
                <Select
                  value={bookingData.billingCountry}
                  onValueChange={(value) => updateBookingData("billingCountry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={bookingData.termsAccepted}
              onCheckedChange={(checked) => updateBookingData("termsAccepted", checked)}
              required
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{course.title}</div>
                <div className="text-sm text-gray-600">{course.category}</div>
                <div className="text-sm text-gray-600">
                  {new Date(course.date).toLocaleDateString()} • {course.venue}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Course Fee</span>
                  <span>${pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${pricing.total.toLocaleString()}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-green-800">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Your payment information is encrypted and secure</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Step 4: Confirmation
  const ConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-xl text-gray-600 mb-4">Thank you for your registration</p>
        <div className="text-lg font-semibold text-purple-600">
          Booking Reference: <span className="font-mono">{bookingReference}</span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Course:</span>
              <span>{course.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Date:</span>
              <span>{new Date(course.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Venue:</span>
              <span>{course.venue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Participant:</span>
              <span>
                {bookingData.firstName} {bookingData.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Paid:</span>
              <span className="font-bold">${pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
        <div className="space-y-2 text-sm text-blue-800 text-left">
          <div className="flex items-start">
            <Mail className="w-4 h-4 mr-2 mt-0.5" />
            <span>Confirmation email sent to {bookingData.email}</span>
          </div>
          <div className="flex items-start">
            <Calendar className="w-4 h-4 mr-2 mt-0.5" />
            <span>Course details and joining instructions will be sent 48 hours before the course</span>
          </div>
          <div className="flex items-start">
            <Phone className="w-4 h-4 mr-2 mt-0.5" />
            <span>Our team will contact you if any additional information is needed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return (
          bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone && bookingData.country
        )
      case 3:
        return (
          bookingData.cardName &&
          bookingData.cardNumber &&
          bookingData.expiryDate &&
          bookingData.cvv &&
          bookingData.billingAddress &&
          bookingData.billingCity &&
          bookingData.billingZip &&
          bookingData.billingCountry &&
          bookingData.termsAccepted
        )
      default:
        return true
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Course Booking</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.id ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="font-medium text-gray-900">{step.title}</div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-300 mx-4 hidden sm:block"></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && <CourseDetailsStep />}
          {currentStep === 2 && <PersonalInfoStep />}
          {currentStep === 3 && <PaymentStep />}
          {currentStep === 4 && <ConfirmationStep />}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === 3 ? (
              <Button
                onClick={processPayment}
                disabled={!isStepValid() || isProcessing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Payment - ${pricing.total.toLocaleString()}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex justify-center pt-6 border-t">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
