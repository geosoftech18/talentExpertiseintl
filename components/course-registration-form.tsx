'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, BookOpen, Loader2, RotateCcw, Lock } from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course, CourseSchedule } from '@/lib/supabase'
import { format } from 'date-fns'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

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

// Comprehensive list of all countries for country selection
const allCountries = [
  { code: "af", name: "Afghanistan" },
  { code: "al", name: "Albania" },
  { code: "dz", name: "Algeria" },
  { code: "as", name: "American Samoa" },
  { code: "ad", name: "Andorra" },
  { code: "ao", name: "Angola" },
  { code: "ai", name: "Anguilla" },
  { code: "aq", name: "Antarctica" },
  { code: "ag", name: "Antigua and Barbuda" },
  { code: "ar", name: "Argentina" },
  { code: "am", name: "Armenia" },
  { code: "aw", name: "Aruba" },
  { code: "au", name: "Australia" },
  { code: "at", name: "Austria" },
  { code: "az", name: "Azerbaijan" },
  { code: "bs", name: "Bahamas" },
  { code: "bh", name: "Bahrain" },
  { code: "bd", name: "Bangladesh" },
  { code: "bb", name: "Barbados" },
  { code: "by", name: "Belarus" },
  { code: "be", name: "Belgium" },
  { code: "bz", name: "Belize" },
  { code: "bj", name: "Benin" },
  { code: "bm", name: "Bermuda" },
  { code: "bt", name: "Bhutan" },
  { code: "bo", name: "Bolivia" },
  { code: "ba", name: "Bosnia and Herzegovina" },
  { code: "bw", name: "Botswana" },
  { code: "br", name: "Brazil" },
  { code: "io", name: "British Indian Ocean Territory" },
  { code: "bn", name: "Brunei" },
  { code: "bg", name: "Bulgaria" },
  { code: "bf", name: "Burkina Faso" },
  { code: "bi", name: "Burundi" },
  { code: "cv", name: "Cabo Verde" },
  { code: "kh", name: "Cambodia" },
  { code: "cm", name: "Cameroon" },
  { code: "ca", name: "Canada" },
  { code: "ky", name: "Cayman Islands" },
  { code: "cf", name: "Central African Republic" },
  { code: "td", name: "Chad" },
  { code: "cl", name: "Chile" },
  { code: "cn", name: "China" },
  { code: "cx", name: "Christmas Island" },
  { code: "cc", name: "Cocos (Keeling) Islands" },
  { code: "co", name: "Colombia" },
  { code: "km", name: "Comoros" },
  { code: "cg", name: "Congo" },
  { code: "cd", name: "Congo (DRC)" },
  { code: "ck", name: "Cook Islands" },
  { code: "cr", name: "Costa Rica" },
  { code: "ci", name: "Côte d'Ivoire" },
  { code: "hr", name: "Croatia" },
  { code: "cu", name: "Cuba" },
  { code: "cw", name: "Curaçao" },
  { code: "cy", name: "Cyprus" },
  { code: "cz", name: "Czech Republic" },
  { code: "dk", name: "Denmark" },
  { code: "dj", name: "Djibouti" },
  { code: "dm", name: "Dominica" },
  { code: "do", name: "Dominican Republic" },
  { code: "ec", name: "Ecuador" },
  { code: "eg", name: "Egypt" },
  { code: "sv", name: "El Salvador" },
  { code: "gq", name: "Equatorial Guinea" },
  { code: "er", name: "Eritrea" },
  { code: "ee", name: "Estonia" },
  { code: "sz", name: "Eswatini" },
  { code: "et", name: "Ethiopia" },
  { code: "fk", name: "Falkland Islands" },
  { code: "fo", name: "Faroe Islands" },
  { code: "fj", name: "Fiji" },
  { code: "fi", name: "Finland" },
  { code: "fr", name: "France" },
  { code: "gf", name: "French Guiana" },
  { code: "pf", name: "French Polynesia" },
  { code: "ga", name: "Gabon" },
  { code: "gm", name: "Gambia" },
  { code: "ge", name: "Georgia" },
  { code: "de", name: "Germany" },
  { code: "gh", name: "Ghana" },
  { code: "gi", name: "Gibraltar" },
  { code: "gr", name: "Greece" },
  { code: "gl", name: "Greenland" },
  { code: "gd", name: "Grenada" },
  { code: "gp", name: "Guadeloupe" },
  { code: "gu", name: "Guam" },
  { code: "gt", name: "Guatemala" },
  { code: "gg", name: "Guernsey" },
  { code: "gn", name: "Guinea" },
  { code: "gw", name: "Guinea-Bissau" },
  { code: "gy", name: "Guyana" },
  { code: "ht", name: "Haiti" },
  { code: "hn", name: "Honduras" },
  { code: "hk", name: "Hong Kong" },
  { code: "hu", name: "Hungary" },
  { code: "is", name: "Iceland" },
  { code: "in", name: "India" },
  { code: "id", name: "Indonesia" },
  { code: "ir", name: "Iran" },
  { code: "iq", name: "Iraq" },
  { code: "ie", name: "Ireland" },
  { code: "im", name: "Isle of Man" },
  { code: "il", name: "Israel" },
  { code: "it", name: "Italy" },
  { code: "jm", name: "Jamaica" },
  { code: "jp", name: "Japan" },
  { code: "je", name: "Jersey" },
  { code: "jo", name: "Jordan" },
  { code: "kz", name: "Kazakhstan" },
  { code: "ke", name: "Kenya" },
  { code: "ki", name: "Kiribati" },
  { code: "kp", name: "Korea (North)" },
  { code: "kr", name: "Korea (South)" },
  { code: "kw", name: "Kuwait" },
  { code: "kg", name: "Kyrgyzstan" },
  { code: "la", name: "Laos" },
  { code: "lv", name: "Latvia" },
  { code: "lb", name: "Lebanon" },
  { code: "ls", name: "Lesotho" },
  { code: "lr", name: "Liberia" },
  { code: "ly", name: "Libya" },
  { code: "li", name: "Liechtenstein" },
  { code: "lt", name: "Lithuania" },
  { code: "lu", name: "Luxembourg" },
  { code: "mo", name: "Macao" },
  { code: "mg", name: "Madagascar" },
  { code: "mw", name: "Malawi" },
  { code: "my", name: "Malaysia" },
  { code: "mv", name: "Maldives" },
  { code: "ml", name: "Mali" },
  { code: "mt", name: "Malta" },
  { code: "mh", name: "Marshall Islands" },
  { code: "mq", name: "Martinique" },
  { code: "mr", name: "Mauritania" },
  { code: "mu", name: "Mauritius" },
  { code: "yt", name: "Mayotte" },
  { code: "mx", name: "Mexico" },
  { code: "fm", name: "Micronesia" },
  { code: "md", name: "Moldova" },
  { code: "mc", name: "Monaco" },
  { code: "mn", name: "Mongolia" },
  { code: "me", name: "Montenegro" },
  { code: "ms", name: "Montserrat" },
  { code: "ma", name: "Morocco" },
  { code: "mz", name: "Mozambique" },
  { code: "mm", name: "Myanmar" },
  { code: "na", name: "Namibia" },
  { code: "nr", name: "Nauru" },
  { code: "np", name: "Nepal" },
  { code: "nl", name: "Netherlands" },
  { code: "nc", name: "New Caledonia" },
  { code: "nz", name: "New Zealand" },
  { code: "ni", name: "Nicaragua" },
  { code: "ne", name: "Niger" },
  { code: "ng", name: "Nigeria" },
  { code: "nu", name: "Niue" },
  { code: "nf", name: "Norfolk Island" },
  { code: "mk", name: "North Macedonia" },
  { code: "mp", name: "Northern Mariana Islands" },
  { code: "no", name: "Norway" },
  { code: "om", name: "Oman" },
  { code: "pk", name: "Pakistan" },
  { code: "pw", name: "Palau" },
  { code: "ps", name: "Palestine" },
  { code: "pa", name: "Panama" },
  { code: "pg", name: "Papua New Guinea" },
  { code: "py", name: "Paraguay" },
  { code: "pe", name: "Peru" },
  { code: "ph", name: "Philippines" },
  { code: "pn", name: "Pitcairn" },
  { code: "pl", name: "Poland" },
  { code: "pt", name: "Portugal" },
  { code: "pr", name: "Puerto Rico" },
  { code: "qa", name: "Qatar" },
  { code: "re", name: "Réunion" },
  { code: "ro", name: "Romania" },
  { code: "ru", name: "Russia" },
  { code: "rw", name: "Rwanda" },
  { code: "bl", name: "Saint Barthélemy" },
  { code: "sh", name: "Saint Helena" },
  { code: "kn", name: "Saint Kitts and Nevis" },
  { code: "lc", name: "Saint Lucia" },
  { code: "mf", name: "Saint Martin" },
  { code: "pm", name: "Saint Pierre and Miquelon" },
  { code: "vc", name: "Saint Vincent and the Grenadines" },
  { code: "ws", name: "Samoa" },
  { code: "sm", name: "San Marino" },
  { code: "st", name: "São Tomé and Príncipe" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "sn", name: "Senegal" },
  { code: "rs", name: "Serbia" },
  { code: "sc", name: "Seychelles" },
  { code: "sl", name: "Sierra Leone" },
  { code: "sg", name: "Singapore" },
  { code: "sx", name: "Sint Maarten" },
  { code: "sk", name: "Slovakia" },
  { code: "si", name: "Slovenia" },
  { code: "sb", name: "Solomon Islands" },
  { code: "so", name: "Somalia" },
  { code: "za", name: "South Africa" },
  { code: "gs", name: "South Georgia and the South Sandwich Islands" },
  { code: "ss", name: "South Sudan" },
  { code: "es", name: "Spain" },
  { code: "lk", name: "Sri Lanka" },
  { code: "sd", name: "Sudan" },
  { code: "sr", name: "Suriname" },
  { code: "sj", name: "Svalbard and Jan Mayen" },
  { code: "se", name: "Sweden" },
  { code: "ch", name: "Switzerland" },
  { code: "sy", name: "Syria" },
  { code: "tw", name: "Taiwan" },
  { code: "tj", name: "Tajikistan" },
  { code: "tz", name: "Tanzania" },
  { code: "th", name: "Thailand" },
  { code: "tl", name: "Timor-Leste" },
  { code: "tg", name: "Togo" },
  { code: "tk", name: "Tokelau" },
  { code: "to", name: "Tonga" },
  { code: "tt", name: "Trinidad and Tobago" },
  { code: "tn", name: "Tunisia" },
  { code: "tr", name: "Turkey" },
  { code: "tm", name: "Turkmenistan" },
  { code: "tc", name: "Turks and Caicos Islands" },
  { code: "tv", name: "Tuvalu" },
  { code: "ug", name: "Uganda" },
  { code: "ua", name: "Ukraine" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
  { code: "um", name: "United States Minor Outlying Islands" },
  { code: "uy", name: "Uruguay" },
  { code: "uz", name: "Uzbekistan" },
  { code: "vu", name: "Vanuatu" },
  { code: "va", name: "Vatican City" },
  { code: "ve", name: "Venezuela" },
  { code: "vn", name: "Vietnam" },
  { code: "vg", name: "Virgin Islands (British)" },
  { code: "vi", name: "Virgin Islands (U.S.)" },
  { code: "wf", name: "Wallis and Futuna" },
  { code: "eh", name: "Western Sahara" },
  { code: "ye", name: "Yemen" },
  { code: "zm", name: "Zambia" },
  { code: "zw", name: "Zimbabwe" },
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

// Inline Stripe Payment Component
function InlineStripePayment({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError 
}: { 
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        const errorMsg = submitError.message || 'Payment form validation failed'
        setError(errorMsg)
        onError(errorMsg)
        setIsProcessing(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        const errorMsg = confirmError.message || 'Payment failed'
        setError(errorMsg)
        onError(errorMsg)
        setIsProcessing(false)
      } else {
        onSuccess()
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.'
      setError(errorMsg)
      onError(errorMsg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900">${amount.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Lock className="w-5 h-5" />
            <span className="text-xs font-semibold">Secure</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
        <div className="min-h-[300px]">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-xs font-medium text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || isProcessing}
        className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </div>
  )
}

export function CourseRegistrationForm({ course, schedules, selectedScheduleId, onClose }: CourseRegistrationFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading, session } = useRequireAuth()
  
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false)
  const [showStripePayment, setShowStripePayment] = useState(false)
  const [captchaValue, setCaptchaValue] = useState<string>('')
  const [countrySearchOpen, setCountrySearchOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  
  // Form data state - must be declared before generateCaptcha
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
    captcha: '',
    // Invoice request specific fields
    contactPerson: '',
    department: '',
    invoiceEmail: '',
    invoiceAddress: ''
  })

  // Generate random CAPTCHA on mount and when needed
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10)
    const num2 = Math.floor(Math.random() * 10)
    const num3 = Math.floor(Math.random() * 10)
    const value = `${num1}${num2}${num3}`
    setCaptchaValue(value)
    // Clear the captcha input when generating new one
    setFormData(prev => ({ ...prev, captcha: '' }))
  }

  useEffect(() => {
    generateCaptcha()
  }, [])
  
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

  // Auto-fill name and email from session when available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user.name || '',
        email: prev.email || session.user.email || '',
        invoiceEmail: prev.invoiceEmail || session.user.email || '',
      }))
    }
  }, [session])

  // Update scheduleId when selectedScheduleId prop changes or schedules load
  useEffect(() => {
    if (selectedScheduleId && schedules.length > 0) {
      // Verify the schedule exists in the schedules array
      const scheduleExists = schedules.find(s => s.id === selectedScheduleId)
      if (scheduleExists) {
        setFormData(prev => {
          if (prev.scheduleId !== selectedScheduleId) {
            return { ...prev, scheduleId: selectedScheduleId }
          }
          return prev
        })
      } else if (schedules.length > 0) {
        // If selectedScheduleId doesn't exist, use first available schedule
        setFormData(prev => {
          if (!prev.scheduleId || !schedules.find(s => s.id === prev.scheduleId)) {
            return { ...prev, scheduleId: schedules[0].id }
          }
          return prev
        })
      }
    } else if (schedules.length > 0) {
      // If no selectedScheduleId but schedules are available, use first one
      setFormData(prev => {
        if (!prev.scheduleId || !schedules.find(s => s.id === prev.scheduleId)) {
          return { ...prev, scheduleId: schedules[0].id }
        }
        return prev
      })
    }
  }, [selectedScheduleId, schedules])

  // Function to create payment intent
  const createPaymentIntent = async () => {
    if (!formData.scheduleId) {
      setSubmitError('Please select a schedule')
      return
    }

    setIsCreatingPaymentIntent(true)
    setSubmitError(null)
    
    try {
      const selectedSchedule = schedules.find(s => s.id === formData.scheduleId)
      const participants = 1
      
      let amount = 0
      if (selectedSchedule?.fees) {
        amount = selectedSchedule.fees * participants
      } else if (selectedSchedule?.price) {
        amount = selectedSchedule.price * participants
      } else {
        amount = 100 * participants
      }

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: formData.scheduleId,
          courseId: course.id,
          courseTitle: course.title,
          participants: participants,
          registrationData: formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent')
      }
      
      setStripeClientSecret(result.clientSecret)
      setStripePaymentIntentId(result.paymentIntentId)
      setPaymentAmount(amount)
      setShowStripePayment(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.')
    } finally {
      setIsCreatingPaymentIntent(false)
    }
  }

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
      } else if (formData.captcha.trim() !== captchaValue) {
        newErrors.captcha = 'CAPTCHA verification failed'
      }
    }

    if (stepNumber === 3) {
      // Step 3 validation for invoice requests
      if (!formData.contactPerson.trim()) {
        newErrors.contactPerson = 'Contact Person is required'
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required'
      }
      if (!formData.invoiceEmail.trim()) {
        newErrors.invoiceEmail = 'Email Address is required'
      } else if (!validateEmail(formData.invoiceEmail)) {
        newErrors.invoiceEmail = 'Please enter a valid email address'
      }
      if (!formData.invoiceAddress.trim()) {
        newErrors.invoiceAddress = 'Address is required'
      }
      if (!formData.mobile.trim()) {
        newErrors.mobile = 'Mobile number is required'
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
    const isStep3Valid = formData.paymentMethod === 'Invoice' ? validateStep(3) : true
    
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      // Navigate to the first step with errors
      if (!isStep1Valid) {
        setStep(1)
      } else if (!isStep2Valid) {
        setStep(2)
      } else if (!isStep3Valid) {
        setStep(3)
      }
      return
    }

    // For Stripe payment, create payment intent and show payment form
    if (formData.paymentMethod === 'stripe') {
      await createPaymentIntent()
      return
    }

    // For invoice payment method, submit invoice request
    if (formData.paymentMethod === 'Invoice') {
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
            paymentMethod: 'invoice', // API expects lowercase 'invoice'
            courseId: course.id,
            courseTitle: course.title,
            // Keep user email and address separate from company email/address
            email: formData.email, // User email (always send original user email)
            address: formData.address, // User address (always send original user address)
            // Include additional invoice fields (company details)
            contactPerson: formData.contactPerson,
            department: formData.department,
            invoiceEmail: formData.invoiceEmail, // Company email (separate from user email)
            invoiceAddress: formData.invoiceAddress, // Company address (separate from user address)
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit invoice request')
        }

        alert(`✅ Invoice request submitted successfully!\n\nYour request will be reviewed by our team. Once approved, an order will be created and you will receive an invoice via email.`)
        onClose()
      } catch (error) {
        console.error('Error submitting invoice request:', error)
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit invoice request. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // For other payment methods, submit normally
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

      alert('Thank you! Your registration has been submitted successfully.')
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
      // If invoice payment method is selected and we're on step 2, go to step 3
      // Otherwise, if we're on step 1, go to step 2
      // For Stripe, max step is 2
      if (formData.paymentMethod === 'Invoice' && step === 2) {
        setStep(3)
      } else if (step < 2) {
        setStep(step + 1)
      }
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
             formData.captcha.trim() === captchaValue
    }
    if (step === 3) {
      // Step 3 validation for invoice requests
      return formData.contactPerson.trim() &&
             formData.department.trim() &&
             formData.invoiceEmail.trim() &&
             validateEmail(formData.invoiceEmail) &&
             formData.invoiceAddress.trim() &&
             formData.mobile.trim()
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
    <>

      {/* Registration Form - Full Page Layout */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card className="w-full shadow-2xl">
            <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-white pb-4 pt-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 hover:bg-slate-200 rounded-full h-8 w-8"
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
              {formData.paymentMethod === 'Invoice' && (
                <>
                  <div className={`h-1 w-12 rounded transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    3
                  </div>
                </>
              )}
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
                      {schedules && schedules.length > 0 ? (
                        schedules.map((schedule) => {
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
                        })
                      ) : (
                        <SelectItem value="no-schedules" disabled>
                          No schedules available
                        </SelectItem>
                      )}
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
                    <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countrySearchOpen}
                          className={`w-full justify-between h-9 text-sm font-normal ${errors.country ? 'border-red-500' : ''}`}
                        >
                          {formData.country
                            ? allCountries.find((country) => country.code === formData.country)?.name
                            : "Select country..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search country..."
                            value={countrySearch}
                            onValueChange={setCountrySearch}
                          />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {allCountries
                                .filter((country) =>
                                  country.name.toLowerCase().includes(countrySearch.toLowerCase())
                                )
                                .map((country) => (
                                  <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => {
                                      handleFieldChange('country', country.code)
                                      setCountrySearchOpen(false)
                                      setCountrySearch('')
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        formData.country === country.code ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {country.name}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                  <Select value={formData.paymentMethod} onValueChange={(value) => {
                    handleFieldChange('paymentMethod', value)
                    setStripeClientSecret(null)
                    setStripePaymentIntentId(null)
                    setShowStripePayment(false)
                    // If switching payment method away from Invoice while on step 3, go back to step 2
                    if (value !== 'Invoice' && step >= 3) {
                      setStep(2)
                    }
                  }}>
                    <SelectTrigger className={`h-9 text-sm ${errors.paymentMethod ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>                    
                      <SelectItem value="Invoice">Invoice to Company</SelectItem>
                    </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>}
                  </div>

                  {/* Inline Stripe Payment Form - Only show after form submission */}
                  {formData.paymentMethod === 'stripe' && showStripePayment && (
                    <div className="mt-4">
                      {isCreatingPaymentIntent ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-sm text-slate-600">Initializing payment...</span>
                        </div>
                      ) : stripeClientSecret ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: stripeClientSecret,
                            appearance: {
                              theme: 'stripe',
                              variables: {
                                colorPrimary: '#2563eb',
                                colorBackground: '#ffffff',
                                colorText: '#1e293b',
                                colorDanger: '#ef4444',
                                fontFamily: 'system-ui, sans-serif',
                                spacingUnit: '4px',
                                borderRadius: '12px',
                              },
                            },
                          }}
                        >
                          <InlineStripePayment
                            clientSecret={stripeClientSecret}
                            amount={paymentAmount}
                            onSuccess={async () => {
                              // Create registration after successful payment
                              if (stripePaymentIntentId) {
                                try {
                                  const response = await fetch('/api/stripe/create-registration', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      paymentIntentId: stripePaymentIntentId,
                                    }),
                                  })

                                  const result = await response.json()

                                  if (result.success) {
                                    alert('✅ Payment successful! Your registration has been completed.')
                                    setStripeClientSecret(null)
                                    setStripePaymentIntentId(null)
                                    onClose()
                                  } else {
                                    alert('✅ Payment successful! Your registration is being processed. You will receive a confirmation email shortly.')
                                    setStripeClientSecret(null)
                                    setStripePaymentIntentId(null)
                                    onClose()
                                  }
                                } catch (error) {
                                  console.error('Error creating registration:', error)
                                  alert('✅ Payment successful! Your registration is being processed. You will receive a confirmation email shortly.')
                                  setStripeClientSecret(null)
                                  setStripePaymentIntentId(null)
                                  onClose()
                                }
                              } else {
                                alert('✅ Payment successful! Your registration is being processed.')
                                setStripeClientSecret(null)
                                setStripePaymentIntentId(null)
                                onClose()
                              }
                            }}
                            onError={(error) => {
                              setSubmitError(error)
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">Please wait while we initialize your payment...</p>
                        </div>
                      )}
                    </div>
                  )}


                
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
                        {captchaValue.split('').join(' ')}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="shrink-0 h-9 w-9"
                        onClick={generateCaptcha}
                        title="Refresh CAPTCHA"
                      >
                        <RotateCcw className="w-4 h-4" />
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

            {step === 3 && (
              <div className="space-y-3 animate-fade-in flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactPerson" className="text-xs font-semibold text-slate-700">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Enter Contact Person"
                        className={`h-9 text-sm ${errors.contactPerson ? 'border-red-500' : ''}`}
                        value={formData.contactPerson}
                        onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                      />
                      {errors.contactPerson && <p className="text-xs text-red-600 mt-1">{errors.contactPerson}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="invoiceDesignation" className="text-xs font-semibold text-slate-700">Your Designation *</Label>
                      <Input
                        id="invoiceDesignation"
                        placeholder="Enter Your Designation"
                        className={`h-9 text-sm ${errors.designation ? 'border-red-500' : ''}`}
                        value={formData.designation}
                        onChange={(e) => handleFieldChange('designation', e.target.value)}
                      />
                      {errors.designation && <p className="text-xs text-red-600 mt-1">{errors.designation}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="department" className="text-xs font-semibold text-slate-700">Department *</Label>
                      <Input
                        id="department"
                        placeholder="Enter Department"
                        className={`h-9 text-sm ${errors.department ? 'border-red-500' : ''}`}
                        value={formData.department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                      />
                      {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department}</p>}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="invoiceMobile" className="text-xs font-semibold text-slate-700">Mobile *</Label>
                      <div className={`flex border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${errors.mobile ? 'border-red-500' : 'border-slate-300'}`}>
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
                          id="invoiceMobile"
                          type="tel"
                          placeholder="Phone Number"
                          className={`h-9 text-sm border-0 rounded-none focus-visible:ring-0 flex-1`}
                          value={formData.mobile}
                          onChange={(e) => {
                            const phoneValue = e.target.value
                            const detectedCode = detectCountryCode(phoneValue, formData.mobileCountryCode)
                            handleFieldChange('mobileCountryCode', detectedCode)
                            handleFieldChange('mobile', phoneValue)
                          }}
                        />
                      </div>
                      {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="invoiceEmail" className="text-xs font-semibold text-slate-700">Email Address *</Label>
                      <Input
                        id="invoiceEmail"
                        type="email"
                        placeholder="Enter Email Address"
                        className={`h-9 text-sm ${errors.invoiceEmail ? 'border-red-500' : ''}`}
                        value={formData.invoiceEmail}
                        onChange={(e) => handleFieldChange('invoiceEmail', e.target.value)}
                      />
                      {errors.invoiceEmail && <p className="text-xs text-red-600 mt-1">{errors.invoiceEmail}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="invoiceAddress" className="text-xs font-semibold text-slate-700">Address *</Label>
                      <Input
                        id="invoiceAddress"
                        placeholder="Address"
                        className={`h-9 text-sm ${errors.invoiceAddress ? 'border-red-500' : ''}`}
                        value={formData.invoiceAddress}
                        onChange={(e) => handleFieldChange('invoiceAddress', e.target.value)}
                      />
                      {errors.invoiceAddress && <p className="text-xs text-red-600 mt-1">{errors.invoiceAddress}</p>}
                    </div>
                  </div>
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
                type={step === 2 && formData.paymentMethod !== 'Invoice' ? 'submit' : step === 3 ? 'submit' : 'button'}
                onClick={step === 2 && formData.paymentMethod === 'Invoice' ? nextStep : step === 3 ? undefined : step === 2 && formData.paymentMethod !== 'Invoice' ? undefined : nextStep}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                {step === 3 ? (
                  isSubmitting ? 'Submitting...' : 'Submit Registration'
                ) : step === 2 && formData.paymentMethod === 'Invoice' ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : step === 2 && formData.paymentMethod !== 'Invoice' ? (
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
      </div>
    </>
  )
}
