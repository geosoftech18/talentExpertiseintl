'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Filter, X, Loader2, ChevronLeft, ChevronRight, RotateCcw, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { generateSlug } from '@/lib/utils/slug'
import * as XLSX from 'xlsx'
import Image from 'next/image'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Cache for Wikipedia images
const wikipediaImageCache = new Map<string, string>()

// Helper function to clean city name by removing hyphens and suffixes
const cleanCityName = (city: string): string => {
  return city.trim().split('-')[0].trim()
}

// Parse venue name to extract city and country
const parseVenueName = (venueName: string): { city: string; country: string } => {
  // Try "City, Country" format first
  if (venueName.includes(',')) {
    const parts = venueName.split(',').map(p => p.trim())
    return {
      city: cleanCityName(parts[0]),
      country: parts[1] || ''
    }
  }
  
  // Try "City-Country" format
  if (venueName.includes('-')) {
    const parts = venueName.split('-').map(p => p.trim())
    return {
      city: cleanCityName(parts[0]),
      country: parts.slice(1).join(' ') || ''
    }
  }
  
  // Default: use entire name as city
  return {
    city: cleanCityName(venueName),
    country: ''
  }
}

// Function to get Wikipedia image URL for a venue
const getWikipediaImageUrl = async (city: string, country: string): Promise<string> => {
  const cacheKey = `${city}, ${country}`.toLowerCase()
  
  // Check cache first
  if (wikipediaImageCache.has(cacheKey)) {
    return wikipediaImageCache.get(cacheKey)!
  }
  
  // Default placeholder image
  const defaultImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Wikipedia-logo-v2-en.svg/1200px-Wikipedia-logo-v2-en.svg.png'
  
  // Clean city name
  const cleanedCity = cleanCityName(city)
  
  try {
    // Try cleaned city name first
    let cityName = encodeURIComponent(cleanedCity)
    let apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`
    
    let response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    // If cleaned city not found, try original city name
    if (!response.ok && cleanedCity !== city.trim()) {
      cityName = encodeURIComponent(city.trim())
      apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
    }
    
    // If city not found, try "City, Country" format
    if (!response.ok && country) {
      const cityCountryName = encodeURIComponent(`${cleanedCity}, ${country}`.trim())
      apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityCountryName}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
    }
    
    // If still not found, try country name
    if (!response.ok && country) {
      const countryName = encodeURIComponent(country.trim())
      apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
    }
    
    if (response.ok) {
      const data = await response.json()
      
      // Prefer originalimage, fallback to thumbnail
      let imageUrl = data.originalimage?.source || data.thumbnail?.source || defaultImage
      
      // Convert thumbnail URL to full size if needed
      if (imageUrl && imageUrl.includes('/thumb/')) {
        imageUrl = imageUrl.replace(/\/thumb\//, '/').replace(/\/\d+px-.*$/, '')
      }
      
      // Cache the result
      wikipediaImageCache.set(cacheKey, imageUrl)
      return imageUrl
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia image for ${city}, ${country}:`, error)
  }
  
  // Cache default image
  wikipediaImageCache.set(cacheKey, defaultImage)
  return defaultImage
}

interface CourseListItem {
  id: string
  slug: string
  title: string
  description: string
  duration: string
  category: string
  courseCode: string
  price: number
  imageUrl?: string | null
  certificateIds?: string[]
  venue?: string
  startDate?: string
  endDate?: string
}

interface Certificate {
  id: string
  name: string
}

export default function VenueCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const venueSlug = params.slug as string
  const venueName = decodeURIComponent(venueSlug)

  const [allCourses, setAllCourses] = useState<CourseListItem[]>([])
  const [availableCertificates, setAvailableCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCertificates, setLoadingCertificates] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCertificate, setSelectedCertificate] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const [venueImage, setVenueImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  // Fetch courses
  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/courses?limit=10000&includeExpired=true')
        const result = await response.json()

        if (!cancelled && result.success) {
          const courses = result.data.map((course: any) => ({
            id: course.id,
            slug: course.slug || generateSlug(course.title),
            title: course.title,
            description: course.description || '',
            duration: course.duration || 'N/A',
            category: course.category || 'Uncategorized',
            courseCode: course.courseCode || '',
            price: course.price || 0,
            imageUrl: course.imageUrl,
            certificateIds: course.certificateIds || [],
            venue: course.venue,
            startDate: course.startDate,
            endDate: course.endDate,
          }))

          setAllCourses(courses)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching courses:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoadingCertificates(true)
        const response = await fetch('/api/certificates')
        const result = await response.json()
        
        if (result.success) {
          setAvailableCertificates(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
        setAvailableCertificates([])
      } finally {
        setLoadingCertificates(false)
      }
    }

    fetchCertificates()
  }, [])

  // Fetch Wikipedia image for venue
  useEffect(() => {
    const fetchVenueImage = async () => {
      try {
        setImageLoading(true)
        const { city, country } = parseVenueName(venueName)
        const imageUrl = await getWikipediaImageUrl(city, country)
        setVenueImage(imageUrl)
      } catch (error) {
        console.error('Error fetching venue image:', error)
        setVenueImage(null)
      } finally {
        setImageLoading(false)
      }
    }

    if (venueName) {
      fetchVenueImage()
    }
  }, [venueName])

  // Filter courses by venue and exclude expired courses
  const venueCourses = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
    return allCourses.filter(course => {
      // Must match venue
      if (course.venue !== venueName) return false
      
      // Filter out expired courses - only show active/upcoming courses
      if (course.endDate) {
        const endDate = new Date(course.endDate)
        endDate.setHours(0, 0, 0, 0)
        return endDate >= today
      } else if (course.startDate) {
        const startDate = new Date(course.startDate)
        startDate.setHours(0, 0, 0, 0)
        return startDate >= today
      }
      
      // If no dates, include it (might be TBD courses)
      return true
    })
  }, [allCourses, venueName])

  // Extract unique values for filters
  const availableCategories = useMemo(() => {
    return Array.from(new Set(venueCourses.map(c => c.category).filter(Boolean))).sort() as string[]
  }, [venueCourses])

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    venueCourses.forEach(course => {
      if (course.startDate) {
        const year = new Date(course.startDate).getFullYear()
        yearSet.add(year)
      }
    })
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [venueCourses])

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...venueCourses]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    if (selectedCertificate !== 'all') {
      filtered = filtered.filter(course => {
        if (!course.certificateIds || course.certificateIds.length === 0) return false
        const certificateIdsAsStrings = course.certificateIds.map((id: any) => String(id))
        return certificateIdsAsStrings.includes(String(selectedCertificate))
      })
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(course => {
        if (!course.startDate) return false
        const month = new Date(course.startDate).getMonth()
        return month === parseInt(selectedMonth)
      })
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(course => {
        if (!course.startDate) return false
        const year = new Date(course.startDate).getFullYear()
        return year === parseInt(selectedYear)
      })
    }

    return filtered
  }, [venueCourses, selectedCategory, selectedCertificate, selectedMonth, selectedYear])

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedCertificate, selectedMonth, selectedYear])

  const resetFilters = () => {
    setSelectedCategory('all')
    setSelectedCertificate('all')
    setSelectedMonth('all')
    setSelectedYear('all')
    setCurrentPage(1)
  }

  // Export to Excel
  const exportToExcel = () => {
    if (venueCourses.length === 0) {
      alert('No courses available to export')
      return
    }

    // Create header row with venue name
    const headerData = [
      { 'Venue': venueName },
      { 'Export Date': format(new Date(), 'yyyy-MM-dd') },
      { 'Total Courses': venueCourses.length },
      {}, // Empty row
    ]

    const exportData = venueCourses.map(course => ({
      'Course Title': course.title,
      'Course Code': course.courseCode || 'N/A',
      'Category': course.category,
      'Start Date': course.startDate ? format(new Date(course.startDate), 'yyyy-MM-dd') : 'TBD',
      'End Date': course.endDate ? format(new Date(course.endDate), 'yyyy-MM-dd') : 'TBD',
      'Fee': course.price > 0 ? `$${course.price.toLocaleString()}` : 'Contact for pricing',
    }))

    // Combine header and data
    const allData = [
      ...headerData.map(row => ({ ...row, 'Course Title': '', 'Course Code': '', 'Category': '', 'Start Date': '', 'End Date': '', 'Fee': '' })),
      ...exportData
    ]

    const worksheet = XLSX.utils.json_to_sheet(allData, { skipHeader: true })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses')
    
    // Auto-size columns
    const wscols = [
      { wch: 30 }, // Venue/Header
      { wch: 40 }, // Course Title
      { wch: 15 }, // Course Code
      { wch: 20 }, // Category
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 18 }, // Fee
    ]
    worksheet['!cols'] = wscols

    // Add header row manually
    const headerRow = ['Course Title', 'Course Code', 'Category', 'Start Date', 'End Date', 'Fee']
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Venue', venueName, '', '', '', ''],
      ['Export Date', format(new Date(), 'yyyy-MM-dd'), '', '', '', ''],
      ['Total Courses', venueCourses.length.toString(), '', '', '', ''],
      [], // Empty row
      headerRow, // Column headers
    ], { origin: 'A1' })

    const filename = `${venueName.replace(/[^a-z0-9]/gi, '_')}_courses_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  // Export to Word
  const exportToWord = () => {
    if (venueCourses.length === 0) {
      alert('No courses available to export')
      return
    }

    // Create HTML content for Word document
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${venueName} - Courses</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }
          h1 {
            color: #0A3049;
            border-bottom: 3px solid #0A3049;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #0A3049;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 30px;
          }
          th {
            background-color: #0A3049;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 10px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .course-title {
            font-weight: bold;
            color: #0A3049;
          }
          .course-code {
            color: #666;
            font-size: 0.9em;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <h1>${venueName} - Training Courses</h1>
        <p><strong>Venue:</strong> ${venueName}</p>
        <p><strong>Total Courses:</strong> ${venueCourses.length}</p>
        <p><strong>Export Date:</strong> ${format(new Date(), 'MMMM dd, yyyy')}</p>
        
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Course Code</th>
              <th>Category</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
    `

    venueCourses.forEach((course, index) => {
      htmlContent += `
        <tr>
          <td class="course-title">${course.title}</td>
          <td class="course-code">${course.courseCode || 'N/A'}</td>
          <td>${course.category}</td>
          <td>${course.startDate ? format(new Date(course.startDate), 'MMM dd, yyyy') : 'TBD'}</td>
          <td>${course.endDate ? format(new Date(course.endDate), 'MMM dd, yyyy') : 'TBD'}</td>
          <td>${course.price > 0 ? `$${course.price.toLocaleString()}` : 'Contact for pricing'}</td>
        </tr>
      `
    })

    htmlContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')} | Talent Expertise Institute</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${venueName.replace(/[^a-z0-9]/gi, '_')}_courses_${format(new Date(), 'yyyy-MM-dd')}.doc`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049]  text-white overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[500px]">
        {/* Background Image */}
        {venueImage && !imageLoading && (
          <div className="absolute inset-0">
            <Image
              src={venueImage}
              alt={venueName}
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              onError={(e) => {
                // Hide image on error, fallback to gradient background
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            {/* Light gradient overlay */}
            <div className="absolute inset-0 opacity-90 bg-gradient-to-r from-[#0A3049]/95 via-[#0A3049]/85 to-[#0A3049]/95" />
          </div>
        )}
        
        {/* Fallback gradient background if no image */}
        {(!venueImage || imageLoading) && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049]" />
        )}
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 z-10">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-white border-blue-400/30 mb-6">
              Training Venue
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {venueName}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed mb-6">
              Discover our comprehensive training programs available at {venueName}. Join us for world-class professional development courses.
            </p>
            
            {/* Download Buttons */}
            {!loading && venueCourses.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg"
                  size="lg"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download Excel
                </Button>
                <Button
                  onClick={exportToWord}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Download Word
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between"
            variant="outline"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-semibold">Filters</span>
            </div>
            <X className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className={`bg-white rounded-lg shadow-lg mb-6 sm:mb-8 p-4 sm:p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="font-semibold text-sm sm:text-base text-slate-700">Filters:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedCertificate} 
              onValueChange={(value) => { setSelectedCertificate(value); setCurrentPage(1) }}
              disabled={loadingCertificates}
            >
              <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                <SelectValue placeholder={loadingCertificates ? "Loading..." : "All Certificates"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certificates</SelectItem>
                {availableCertificates.map((certificate) => (
                  <SelectItem key={certificate.id} value={certificate.id}>
                    {certificate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full sm:w-auto h-9 sm:h-10 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Courses Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading courses...</h3>
          </div>
        ) : filteredCourses.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
              <table className="w-full border-collapse min-w-[800px]">
                <thead className="bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Course Title</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Course Date</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedCourses.map((course) => (
                    <tr
                      key={course.id}
                      onClick={() => router.push(`/courses/${course.slug}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm sm:text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {course.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs sm:text-sm">
                        {course.startDate ? (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>
                              {format(new Date(course.startDate), 'MMM dd')}
                              {course.endDate && ` - ${format(new Date(course.endDate), 'MMM dd, yyyy')}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">TBD</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs sm:text-sm hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      </td>
                      <td className="px-4 py-4 text-xs sm:text-sm">
                        {course.price > 0 ? (
                          <span className="font-bold text-slate-900">${course.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400">Contact for pricing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
                  <span className="font-semibold">{filteredCourses.length}</span> courses
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'bg-[#0A3049] text-white' : ''}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg text-center py-12">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-sm text-slate-600">
              No courses available at {venueName} with the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

