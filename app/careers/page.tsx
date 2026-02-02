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

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    telephone: '',
    telephoneCountryCode: '+971',
    mobile: '',
    mobileCountryCode: '+971',
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
        telephoneCountryCode: '+971',
        mobile: '',
        mobileCountryCode: '+971',
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

  // Comprehensive list of all countries with phone codes and ISO codes
  // Sorted alphabetically by country name
  const countryCodes = [
    { code: '+93', iso: 'af', country: 'Afghanistan' },
    { code: '+355', iso: 'al', country: 'Albania' },
    { code: '+213', iso: 'dz', country: 'Algeria' },
    { code: '+376', iso: 'ad', country: 'Andorra' },
    { code: '+244', iso: 'ao', country: 'Angola' },
    { code: '+1264', iso: 'ai', country: 'Anguilla' },
    { code: '+1268', iso: 'ag', country: 'Antigua and Barbuda' },
    { code: '+54', iso: 'ar', country: 'Argentina' },
    { code: '+374', iso: 'am', country: 'Armenia' },
    { code: '+297', iso: 'aw', country: 'Aruba' },
    { code: '+61', iso: 'au', country: 'Australia' },
    { code: '+43', iso: 'at', country: 'Austria' },
    { code: '+994', iso: 'az', country: 'Azerbaijan' },
    { code: '+1242', iso: 'bs', country: 'Bahamas' },
    { code: '+973', iso: 'bh', country: 'Bahrain' },
    { code: '+880', iso: 'bd', country: 'Bangladesh' },
    { code: '+1246', iso: 'bb', country: 'Barbados' },
    { code: '+375', iso: 'by', country: 'Belarus' },
    { code: '+32', iso: 'be', country: 'Belgium' },
    { code: '+501', iso: 'bz', country: 'Belize' },
    { code: '+229', iso: 'bj', country: 'Benin' },
    { code: '+1441', iso: 'bm', country: 'Bermuda' },
    { code: '+975', iso: 'bt', country: 'Bhutan' },
    { code: '+591', iso: 'bo', country: 'Bolivia' },
    { code: '+387', iso: 'ba', country: 'Bosnia and Herzegovina' },
    { code: '+267', iso: 'bw', country: 'Botswana' },
    { code: '+55', iso: 'br', country: 'Brazil' },
    { code: '+246', iso: 'io', country: 'British Indian Ocean Territory' },
    { code: '+1284', iso: 'vg', country: 'British Virgin Islands' },
    { code: '+673', iso: 'bn', country: 'Brunei' },
    { code: '+359', iso: 'bg', country: 'Bulgaria' },
    { code: '+226', iso: 'bf', country: 'Burkina Faso' },
    { code: '+257', iso: 'bi', country: 'Burundi' },
    { code: '+855', iso: 'kh', country: 'Cambodia' },
    { code: '+237', iso: 'cm', country: 'Cameroon' },
    { code: '+1', iso: 'ca', country: 'Canada' },
    { code: '+238', iso: 'cv', country: 'Cape Verde' },
    { code: '+1345', iso: 'ky', country: 'Cayman Islands' },
    { code: '+236', iso: 'cf', country: 'Central African Republic' },
    { code: '+235', iso: 'td', country: 'Chad' },
    { code: '+56', iso: 'cl', country: 'Chile' },
    { code: '+86', iso: 'cn', country: 'China' },
    { code: '+57', iso: 'co', country: 'Colombia' },
    { code: '+269', iso: 'km', country: 'Comoros' },
    { code: '+242', iso: 'cg', country: 'Congo' },
    { code: '+243', iso: 'cd', country: 'Congo, Democratic Republic' },
    { code: '+682', iso: 'ck', country: 'Cook Islands' },
    { code: '+506', iso: 'cr', country: 'Costa Rica' },
    { code: '+225', iso: 'ci', country: 'Côte d\'Ivoire' },
    { code: '+385', iso: 'hr', country: 'Croatia' },
    { code: '+53', iso: 'cu', country: 'Cuba' },
    { code: '+357', iso: 'cy', country: 'Cyprus' },
    { code: '+420', iso: 'cz', country: 'Czech Republic' },
    { code: '+45', iso: 'dk', country: 'Denmark' },
    { code: '+253', iso: 'dj', country: 'Djibouti' },
    { code: '+1767', iso: 'dm', country: 'Dominica' },
    { code: '+1809', iso: 'do', country: 'Dominican Republic' },
    { code: '+593', iso: 'ec', country: 'Ecuador' },
    { code: '+20', iso: 'eg', country: 'Egypt' },
    { code: '+503', iso: 'sv', country: 'El Salvador' },
    { code: '+240', iso: 'gq', country: 'Equatorial Guinea' },
    { code: '+291', iso: 'er', country: 'Eritrea' },
    { code: '+372', iso: 'ee', country: 'Estonia' },
    { code: '+251', iso: 'et', country: 'Ethiopia' },
    { code: '+500', iso: 'fk', country: 'Falkland Islands' },
    { code: '+298', iso: 'fo', country: 'Faroe Islands' },
    { code: '+679', iso: 'fj', country: 'Fiji' },
    { code: '+358', iso: 'fi', country: 'Finland' },
    { code: '+33', iso: 'fr', country: 'France' },
    { code: '+594', iso: 'gf', country: 'French Guiana' },
    { code: '+689', iso: 'pf', country: 'French Polynesia' },
    { code: '+241', iso: 'ga', country: 'Gabon' },
    { code: '+220', iso: 'gm', country: 'Gambia' },
    { code: '+995', iso: 'ge', country: 'Georgia' },
    { code: '+49', iso: 'de', country: 'Germany' },
    { code: '+233', iso: 'gh', country: 'Ghana' },
    { code: '+350', iso: 'gi', country: 'Gibraltar' },
    { code: '+30', iso: 'gr', country: 'Greece' },
    { code: '+299', iso: 'gl', country: 'Greenland' },
    { code: '+1473', iso: 'gd', country: 'Grenada' },
    { code: '+590', iso: 'gp', country: 'Guadeloupe' },
    { code: '+1671', iso: 'gu', country: 'Guam' },
    { code: '+502', iso: 'gt', country: 'Guatemala' },
    { code: '+224', iso: 'gn', country: 'Guinea' },
    { code: '+245', iso: 'gw', country: 'Guinea-Bissau' },
    { code: '+592', iso: 'gy', country: 'Guyana' },
    { code: '+509', iso: 'ht', country: 'Haiti' },
    { code: '+504', iso: 'hn', country: 'Honduras' },
    { code: '+852', iso: 'hk', country: 'Hong Kong' },
    { code: '+36', iso: 'hu', country: 'Hungary' },
    { code: '+354', iso: 'is', country: 'Iceland' },
    { code: '+91', iso: 'in', country: 'India' },
    { code: '+62', iso: 'id', country: 'Indonesia' },
    { code: '+98', iso: 'ir', country: 'Iran' },
    { code: '+964', iso: 'iq', country: 'Iraq' },
    { code: '+353', iso: 'ie', country: 'Ireland' },
    { code: '+972', iso: 'il', country: 'Israel' },
    { code: '+39', iso: 'it', country: 'Italy' },
    { code: '+1876', iso: 'jm', country: 'Jamaica' },
    { code: '+81', iso: 'jp', country: 'Japan' },
    { code: '+962', iso: 'jo', country: 'Jordan' },
    { code: '+7', iso: 'kz', country: 'Kazakhstan' },
    { code: '+254', iso: 'ke', country: 'Kenya' },
    { code: '+686', iso: 'ki', country: 'Kiribati' },
    { code: '+965', iso: 'kw', country: 'Kuwait' },
    { code: '+996', iso: 'kg', country: 'Kyrgyzstan' },
    { code: '+856', iso: 'la', country: 'Laos' },
    { code: '+371', iso: 'lv', country: 'Latvia' },
    { code: '+961', iso: 'lb', country: 'Lebanon' },
    { code: '+266', iso: 'ls', country: 'Lesotho' },
    { code: '+231', iso: 'lr', country: 'Liberia' },
    { code: '+218', iso: 'ly', country: 'Libya' },
    { code: '+423', iso: 'li', country: 'Liechtenstein' },
    { code: '+370', iso: 'lt', country: 'Lithuania' },
    { code: '+352', iso: 'lu', country: 'Luxembourg' },
    { code: '+853', iso: 'mo', country: 'Macau' },
    { code: '+389', iso: 'mk', country: 'North Macedonia' },
    { code: '+261', iso: 'mg', country: 'Madagascar' },
    { code: '+265', iso: 'mw', country: 'Malawi' },
    { code: '+60', iso: 'my', country: 'Malaysia' },
    { code: '+960', iso: 'mv', country: 'Maldives' },
    { code: '+223', iso: 'ml', country: 'Mali' },
    { code: '+356', iso: 'mt', country: 'Malta' },
    { code: '+692', iso: 'mh', country: 'Marshall Islands' },
    { code: '+596', iso: 'mq', country: 'Martinique' },
    { code: '+222', iso: 'mr', country: 'Mauritania' },
    { code: '+230', iso: 'mu', country: 'Mauritius' },
    { code: '+262', iso: 'yt', country: 'Mayotte' },
    { code: '+52', iso: 'mx', country: 'Mexico' },
    { code: '+691', iso: 'fm', country: 'Micronesia' },
    { code: '+373', iso: 'md', country: 'Moldova' },
    { code: '+377', iso: 'mc', country: 'Monaco' },
    { code: '+976', iso: 'mn', country: 'Mongolia' },
    { code: '+382', iso: 'me', country: 'Montenegro' },
    { code: '+1664', iso: 'ms', country: 'Montserrat' },
    { code: '+212', iso: 'ma', country: 'Morocco' },
    { code: '+258', iso: 'mz', country: 'Mozambique' },
    { code: '+95', iso: 'mm', country: 'Myanmar' },
    { code: '+264', iso: 'na', country: 'Namibia' },
    { code: '+674', iso: 'nr', country: 'Nauru' },
    { code: '+977', iso: 'np', country: 'Nepal' },
    { code: '+31', iso: 'nl', country: 'Netherlands' },
    { code: '+687', iso: 'nc', country: 'New Caledonia' },
    { code: '+64', iso: 'nz', country: 'New Zealand' },
    { code: '+505', iso: 'ni', country: 'Nicaragua' },
    { code: '+227', iso: 'ne', country: 'Niger' },
    { code: '+234', iso: 'ng', country: 'Nigeria' },
    { code: '+683', iso: 'nu', country: 'Niue' },
    { code: '+850', iso: 'kp', country: 'North Korea' },
    { code: '+1670', iso: 'mp', country: 'Northern Mariana Islands' },
    { code: '+47', iso: 'no', country: 'Norway' },
    { code: '+968', iso: 'om', country: 'Oman' },
    { code: '+92', iso: 'pk', country: 'Pakistan' },
    { code: '+680', iso: 'pw', country: 'Palau' },
    { code: '+970', iso: 'ps', country: 'Palestine' },
    { code: '+507', iso: 'pa', country: 'Panama' },
    { code: '+675', iso: 'pg', country: 'Papua New Guinea' },
    { code: '+595', iso: 'py', country: 'Paraguay' },
    { code: '+51', iso: 'pe', country: 'Peru' },
    { code: '+63', iso: 'ph', country: 'Philippines' },
    { code: '+48', iso: 'pl', country: 'Poland' },
    { code: '+351', iso: 'pt', country: 'Portugal' },
    { code: '+1787', iso: 'pr', country: 'Puerto Rico' },
    { code: '+974', iso: 'qa', country: 'Qatar' },
    { code: '+262', iso: 're', country: 'Réunion' },
    { code: '+40', iso: 'ro', country: 'Romania' },
    { code: '+7', iso: 'ru', country: 'Russia' },
    { code: '+250', iso: 'rw', country: 'Rwanda' },
    { code: '+290', iso: 'sh', country: 'Saint Helena' },
    { code: '+1869', iso: 'kn', country: 'Saint Kitts and Nevis' },
    { code: '+1758', iso: 'lc', country: 'Saint Lucia' },
    { code: '+508', iso: 'pm', country: 'Saint Pierre and Miquelon' },
    { code: '+1784', iso: 'vc', country: 'Saint Vincent and the Grenadines' },
    { code: '+685', iso: 'ws', country: 'Samoa' },
    { code: '+378', iso: 'sm', country: 'San Marino' },
    { code: '+239', iso: 'st', country: 'São Tomé and Príncipe' },
    { code: '+966', iso: 'sa', country: 'Saudi Arabia' },
    { code: '+221', iso: 'sn', country: 'Senegal' },
    { code: '+381', iso: 'rs', country: 'Serbia' },
    { code: '+248', iso: 'sc', country: 'Seychelles' },
    { code: '+232', iso: 'sl', country: 'Sierra Leone' },
    { code: '+65', iso: 'sg', country: 'Singapore' },
    { code: '+1721', iso: 'sx', country: 'Sint Maarten' },
    { code: '+421', iso: 'sk', country: 'Slovakia' },
    { code: '+386', iso: 'si', country: 'Slovenia' },
    { code: '+677', iso: 'sb', country: 'Solomon Islands' },
    { code: '+252', iso: 'so', country: 'Somalia' },
    { code: '+27', iso: 'za', country: 'South Africa' },
    { code: '+82', iso: 'kr', country: 'South Korea' },
    { code: '+211', iso: 'ss', country: 'South Sudan' },
    { code: '+34', iso: 'es', country: 'Spain' },
    { code: '+94', iso: 'lk', country: 'Sri Lanka' },
    { code: '+249', iso: 'sd', country: 'Sudan' },
    { code: '+597', iso: 'sr', country: 'Suriname' },
    { code: '+268', iso: 'sz', country: 'Eswatini' },
    { code: '+46', iso: 'se', country: 'Sweden' },
    { code: '+41', iso: 'ch', country: 'Switzerland' },
    { code: '+963', iso: 'sy', country: 'Syria' },
    { code: '+886', iso: 'tw', country: 'Taiwan' },
    { code: '+992', iso: 'tj', country: 'Tajikistan' },
    { code: '+255', iso: 'tz', country: 'Tanzania' },
    { code: '+66', iso: 'th', country: 'Thailand' },
    { code: '+670', iso: 'tl', country: 'Timor-Leste' },
    { code: '+228', iso: 'tg', country: 'Togo' },
    { code: '+690', iso: 'tk', country: 'Tokelau' },
    { code: '+676', iso: 'to', country: 'Tonga' },
    { code: '+1868', iso: 'tt', country: 'Trinidad and Tobago' },
    { code: '+216', iso: 'tn', country: 'Tunisia' },
    { code: '+90', iso: 'tr', country: 'Turkey' },
    { code: '+993', iso: 'tm', country: 'Turkmenistan' },
    { code: '+1649', iso: 'tc', country: 'Turks and Caicos Islands' },
    { code: '+688', iso: 'tv', country: 'Tuvalu' },
    { code: '+256', iso: 'ug', country: 'Uganda' },
    { code: '+380', iso: 'ua', country: 'Ukraine' },
    { code: '+971', iso: 'ae', country: 'United Arab Emirates' },
    { code: '+44', iso: 'gb', country: 'United Kingdom' },
    { code: '+1', iso: 'us', country: 'United States' },
    { code: '+598', iso: 'uy', country: 'Uruguay' },
    { code: '+998', iso: 'uz', country: 'Uzbekistan' },
    { code: '+678', iso: 'vu', country: 'Vanuatu' },
    { code: '+379', iso: 'va', country: 'Vatican City' },
    { code: '+58', iso: 've', country: 'Venezuela' },
    { code: '+84', iso: 'vn', country: 'Vietnam' },
    { code: '+1340', iso: 'vi', country: 'U.S. Virgin Islands' },
    { code: '+681', iso: 'wf', country: 'Wallis and Futuna' },
    { code: '+967', iso: 'ye', country: 'Yemen' },
    { code: '+260', iso: 'zm', country: 'Zambia' },
    { code: '+263', iso: 'zw', country: 'Zimbabwe' },
  ].sort((a, b) => a.country.localeCompare(b.country))

  // Helper function to get flag image URL
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

