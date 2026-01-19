'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { Search, Calendar, MapPin, Clock, X, SlidersHorizontal, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { CourseRegistrationForm } from '@/components/course-registration-form'
import type { Course, CourseSchedule } from '@/lib/supabase'

interface CourseListItem {
  id: string
  slug: string
  title: string
  description: string
  duration: string
  category: string
  courseCode: string
  price: number
  rating?: number
  featured?: boolean
  trending?: boolean
  imageUrl?: string | null
  certificateIds?: string[]
  // For display purposes
  venue?: string
  startDate?: string
  endDate?: string
  seats?: number
  level?: string
}

interface Certificate {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  status: string
}


function CourseFinderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [sortByMonth, setSortByMonth] = useState<boolean>(false)
  const [sortByYear, setSortByYear] = useState<boolean>(false)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedCertificate, setSelectedCertificate] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 12
  const [allCourses, setAllCourses] = useState<CourseListItem[]>([])
  const [availableCertificates, setAvailableCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCertificates, setLoadingCertificates] = useState(true)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedSchedules, setSelectedSchedules] = useState<CourseSchedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [loadingCourseData, setLoadingCourseData] = useState(false)

  // Cache key for sessionStorage
  const CACHE_KEY = 'courses_cache'
  const CACHE_TIMESTAMP_KEY = 'courses_cache_timestamp'
  const CACHE_VERSION_KEY = 'courses_cache_version'
  const CACHE_VERSION = '2' // Increment when data structure changes (e.g., adding certificateIds)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Fetch courses from database (schedules are already included in the response)
  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        // Check if we have cached data (only in browser)
        if (typeof window !== 'undefined') {
          const cachedData = sessionStorage.getItem(CACHE_KEY)
          const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY)
          const cacheVersion = sessionStorage.getItem(CACHE_VERSION_KEY)
          
          if (cachedData && cacheTimestamp) {
            const timestamp = parseInt(cacheTimestamp)
            const now = Date.now()
            
            // Use cached data if it's still fresh (less than 5 minutes old) and version matches
            if (now - timestamp < CACHE_DURATION && cacheVersion === CACHE_VERSION) {
              const parsedData = JSON.parse(cachedData)
              if (!cancelled) {
                setAllCourses(parsedData)
                setLoading(false)
                return // Don't fetch if we have fresh cache
              }
            }
          }
        }

        // No cache or cache expired - fetch fresh data
        setLoading(true)
        // Fetch all courses including expired ones to populate year/month filters
        const coursesResponse = await fetch('/api/courses?limit=10000&includeExpired=true')

        const coursesResult = await coursesResponse.json()

        if (!cancelled && coursesResult.success) {
          // Courses already have schedule data enriched from API
          setAllCourses(coursesResult.data)
          
          // Cache the data for future navigation (only in browser)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(coursesResult.data))
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
            sessionStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching courses:', error)
          
          // Try to use cached data even if expired as fallback (only in browser)
          if (typeof window !== 'undefined') {
            const cachedData = sessionStorage.getItem(CACHE_KEY)
            if (cachedData) {
              try {
                const parsedData = JSON.parse(cachedData)
                setAllCourses(parsedData)
              } catch (e) {
                // Ignore cache parse errors
              }
            }
          }
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

  // Fetch certificates from database
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

  // Read venue, category, search, and certificate from URL params and update when they change
  useEffect(() => {
    const venueParam = searchParams.get('venue')
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const certificateParam = searchParams.get('certificate')
    
    // Update venue filter from URL param
    if (venueParam) {
      const decodedVenue = decodeURIComponent(venueParam)
      // Set venue filter immediately when URL param is present
      setSelectedVenue(decodedVenue)
      setCurrentPage(1)
    } else {
      // Reset to 'all' if no venue param
      setSelectedVenue('all')
    }
    
    // Update category filter from URL param
    if (categoryParam) {
      const decodedCategory = decodeURIComponent(categoryParam)
      setSelectedCategory(decodedCategory)
      setCurrentPage(1)
    } else {
      // Reset to 'all' if no category param
      setSelectedCategory('all')
    }
    
    // Update search term from URL param
    if (searchParam) {
      const decodedSearch = decodeURIComponent(searchParam)
      setSearchTerm(decodedSearch)
      setCurrentPage(1)
    } else {
      // Reset search if no search param
      setSearchTerm('')
    }
    
    // Update certificate filter from URL param
    if (certificateParam) {
      const decodedCertificate = decodeURIComponent(certificateParam)
      setSelectedCertificate(decodedCertificate)
      setCurrentPage(1)
    } else {
      // Reset to 'all' if no certificate param
      setSelectedCertificate('all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]) // Run when searchParams change

  // Extract unique categories and venues from fetched courses
  const categories = useMemo(() => {
    return Array.from(new Set(allCourses.map(c => c.category))).sort()
  }, [allCourses])

  const availableVenues = useMemo(() => {
    const venueSet = new Set<string>()
    allCourses.forEach(course => {
      if (course.venue) venueSet.add(course.venue)
    })
    return Array.from(venueSet).sort()
  }, [allCourses])

  // Extract available years from courses
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    allCourses.forEach(course => {
      if (course.startDate) {
        const year = new Date(course.startDate).getFullYear()
        yearSet.add(year)
      }
    })
    return Array.from(yearSet).sort((a, b) => b - a) // Latest first
  }, [allCourses])

  // Show all 12 months in chronological order (January-December)
  // This provides a consistent and predictable month filter
  const availableMonths = useMemo(() => {
    // Always return all 12 months in order (0-11 = January-December)
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  }, [])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const filteredCourses = useMemo(() => {
    let filtered = allCourses

    // Filter out expired courses - only show upcoming schedules
    // BUT: If user has selected a specific month or year, show courses for that period even if expired
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
    // Only filter out expired courses if no specific month/year is selected
    const hasSpecificMonthFilter = selectedMonth !== 'all'
    const hasSpecificYearFilter = selectedYear !== 'all'
    
    if (!hasSpecificMonthFilter && !hasSpecificYearFilter) {
      // No specific month/year selected - only show upcoming courses
      filtered = filtered.filter(course => {
        // If course has no start date, exclude it (only show courses with upcoming dates)
        if (!course.startDate) {
          return false
        }
        
        // Check if start date is today or in the future
        const startDate = new Date(course.startDate)
        startDate.setHours(0, 0, 0, 0)
        return startDate >= today
      })
    } else {
      // Specific month/year selected - show courses for that period (including past)
      filtered = filtered.filter(course => {
        // If course has no start date, exclude it
        if (!course.startDate) {
          return false
        }
        return true
      })
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    // Venue filter - exact case-insensitive matching
    if (selectedVenue !== 'all' && selectedVenue) {
      filtered = filtered.filter(course => {
        if (!course.venue) return false
        // Exact match after trimming and lowercasing
        const courseVenue = course.venue.trim()
        const filterVenue = selectedVenue.trim()
        // Case-insensitive exact match
        return courseVenue.toLowerCase() === filterVenue.toLowerCase()
      })
    }

     // Certificate filter
     if (selectedCertificate !== 'all') {
      filtered = filtered.filter(course => {
        // If course has no certificateIds, exclude it when a specific certificate is selected
        if (!course.certificateIds || !Array.isArray(course.certificateIds) || course.certificateIds.length === 0) {
          return false
        }
        // Convert all IDs to strings for comparison (MongoDB ObjectIds may be strings or objects)
        const certificateIdsAsStrings = course.certificateIds.map((id: any) => {
          // Handle both string IDs and ObjectId objects
          if (typeof id === 'string') return id
          if (id && typeof id === 'object' && id.toString) return id.toString()
          return String(id)
        })
        const selectedCertId = String(selectedCertificate)
        return certificateIdsAsStrings.some((id: string) => id === selectedCertId)
      })
    }

    // Duration filter
    if (selectedDuration !== 'all') {
      const days = parseInt(selectedDuration)
      filtered = filtered.filter(course => {
        const courseDays = parseInt(course.duration)
        return courseDays === days
      })
    }

    // Year filter
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear)
      filtered = filtered.filter(course => {
        if (!course.startDate) return false
        const courseYear = new Date(course.startDate).getFullYear()
        return courseYear === year
      })
    }

    // Month filter
    if (selectedMonth !== 'all') {
      const month = parseInt(selectedMonth)
      filtered = filtered.filter(course => {
        if (!course.startDate) return false
        const courseMonth = new Date(course.startDate).getMonth()
        return courseMonth === month
      })
    }

   

    // Sort based on selected option
    filtered.sort((a, b) => {
      // Apply year sort first if enabled
      if (sortByYear) {
        const aYear = a.startDate ? new Date(a.startDate).getFullYear() : Infinity
        const bYear = b.startDate ? new Date(b.startDate).getFullYear() : Infinity
        if (aYear !== bYear) return aYear - bYear
      }
      
      // Apply month sort if enabled
      if (sortByMonth) {
        const aMonth = a.startDate ? new Date(a.startDate).getMonth() : 12
        const bMonth = b.startDate ? new Date(b.startDate).getMonth() : 12
        if (aMonth !== bMonth) return aMonth - bMonth
      }
      
      // If both month and year are enabled and they match, or if only one is enabled and they match,
      // fall through to the main sortBy logic
      // Otherwise, apply the main sortBy logic
      switch (sortBy) {
        case 'name':
          // Sort by name (A-Z)
          return a.title.localeCompare(b.title)
        
        case 'date':
          // Sort by date: Earliest First
          const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity
          const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity
          return aDate - bDate
        
        case 'date-desc':
          // Sort by date: Latest First
          const aDateDesc = a.startDate ? new Date(a.startDate).getTime() : 0
          const bDateDesc = b.startDate ? new Date(b.startDate).getTime() : 0
          return bDateDesc - aDateDesc
        
        default:
          // Relevance: featured first, then trending, then by date
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          if (a.trending && !b.trending) return -1
          if (!a.trending && b.trending) return 1
          // Finally sort by date (earliest first)
          const aDateRel = a.startDate ? new Date(a.startDate).getTime() : Infinity
          const bDateRel = b.startDate ? new Date(b.startDate).getTime() : Infinity
          return aDateRel - bDateRel
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedVenue, selectedDuration, selectedYear, selectedMonth, selectedCertificate, sortBy, sortByMonth, sortByYear, allCourses])

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  )

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedVenue('all')
    setSelectedDuration('all')
    setSelectedYear('all')
    setSelectedMonth('all')
    setSelectedCertificate('all')
    setSortBy('relevance')
    setSortByMonth(false)
    setSortByYear(false)
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedVenue !== 'all',
    selectedDuration !== 'all',
    selectedYear !== 'all',
    selectedMonth !== 'all',
    selectedCertificate !== 'all',
    sortBy !== 'relevance',
    sortByMonth,
    sortByYear,
  ].filter(Boolean).length

  const handleRegisterClick = async (e: React.MouseEvent, course: CourseListItem) => {
    e.stopPropagation() // Prevent row click
    setLoadingCourseData(true)
    
    try {
      // Fetch full course details with schedules
      const response = await fetch(`/api/courses/${course.slug}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const courseData = result.data.course as Course
        const schedules = result.data.schedules as CourseSchedule[]
        
        // Try to find matching schedule based on the course row's date/venue
        let matchingScheduleId: string | null = null
        if (course.startDate && schedules.length > 0) {
          const matchingSchedule = schedules.find(s => {
            const scheduleStart = s.start_date ? new Date(s.start_date).toISOString().split('T')[0] : null
            const rowStart = course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : null
            return scheduleStart === rowStart && 
                   (s.venue === course.venue || (!s.venue && !course.venue))
          })
          if (matchingSchedule) {
            matchingScheduleId = matchingSchedule.id
          } else if (schedules.length > 0) {
            // If no exact match, use first schedule
            matchingScheduleId = schedules[0].id
          }
        } else if (schedules.length > 0) {
          matchingScheduleId = schedules[0].id
        }
        
        setSelectedCourse(courseData)
        setSelectedSchedules(schedules)
        setSelectedScheduleId(matchingScheduleId)
        setShowRegistration(true)
      } else {
        alert('Failed to load course details. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      alert('Failed to load course details. Please try again.')
    } finally {
      setLoadingCourseData(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {showRegistration && selectedCourse && (
        <CourseRegistrationForm
          course={selectedCourse}
          schedules={selectedSchedules}
          selectedScheduleId={selectedScheduleId}
          onClose={() => {
            setShowRegistration(false)
            setSelectedCourse(null)
            setSelectedSchedules([])
            setSelectedScheduleId(null)
          }}
        />
      )}
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Course Finder
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed">
              Discover the perfect training program from our comprehensive catalog of professional development courses.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Search Bar */}
        <Card className="shadow-lg mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between"
            variant="outline"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-600 text-white ml-2">{activeFiltersCount}</Badge>
              )}
            </div>
            <X className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Sidebar - Filters */}
          <aside className={`w-full lg:w-80 lg:shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="shadow-lg lg:sticky lg:top-24">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Filters</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-blue-600 text-white text-xs">{activeFiltersCount}</Badge>
                  )}
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Category Filter */}
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                      Category
                    </Label>
                    <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1) }}>
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Venue Filter */}
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                      Venue
                    </Label>
                    <Select value={selectedVenue} onValueChange={(value) => { setSelectedVenue(value); setCurrentPage(1) }}>
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="All Venues" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Venues</SelectItem>
                        {availableVenues.map((venue) => (
                          <SelectItem key={venue} value={venue}>{venue}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                   {/* Certificate Filter */}
                   <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                        Filter by Certificate
                      </Label>
                      <Select 
                        value={selectedCertificate} 
                        onValueChange={(value) => { setSelectedCertificate(value); setCurrentPage(1) }}
                        disabled={loadingCertificates}
                      >
                        <SelectTrigger className="w-full h-9 sm:h-10">
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
                    </div>

                  {/* Sort Filter */}
                  <div className="space-y-3">
                   
                    
                    {/* Year Filter */}
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                        Filter by Year
                      </Label>
                      <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setCurrentPage(1) }}>
                        <SelectTrigger className="w-full h-9 sm:h-10">
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                        Filter by Month
                      </Label>
                      <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value); setCurrentPage(1) }}>
                        <SelectTrigger className="w-full h-9 sm:h-10">
                          <SelectValue placeholder="All Months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Months</SelectItem>
                          {availableMonths.map((month) => (
                            <SelectItem key={month} value={month.toString()}>{monthNames[month]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  

                    {/* Additional Sort Options */}
                    {/* <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                        Additional Sort Options
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sort-by-year"
                            checked={sortByYear}
                            onCheckedChange={(checked) => setSortByYear(checked === true)}
                            className='border-slate-500'
                          />
                          <label
                            htmlFor="sort-by-year"
                            className="text-xs sm:text-sm text-slate-700 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Sort by Year
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sort-by-month"
                            checked={sortByMonth}
                            onCheckedChange={(checked) => setSortByMonth(checked === true)}
                            className='border-slate-500'
                          />
                          <label
                            htmlFor="sort-by-month"
                            className="text-xs sm:text-sm text-slate-700 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Sort by Month
                          </label>
                        </div>
                      </div>
                      {(sortByYear || sortByMonth) && (
                        <p className="text-xs text-slate-500 mt-1">
                          {sortByYear && sortByMonth 
                            ? 'Sorting by Year, then Month, then main sort'
                            : sortByYear 
                            ? 'Sorting by Year, then main sort'
                            : 'Sorting by Month, then main sort'}
                        </p>
                      )}
                    </div> */}
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right Side - Course Table/Cards */}
          <div className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{paginatedCourses.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{filteredCourses.length}</span> courses
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <Card className="text-center py-12 sm:py-16">
                <CardContent>
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mt-4">Loading courses...</p>
                </CardContent>
              </Card>
            ) : paginatedCourses.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <Card className="shadow-lg hidden lg:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Course Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Venue
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Fee
                            </th>
                            {/* <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Register
                            </th> */}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {paginatedCourses.map((course) => (
                            <tr
                              key={course.id}
                              onClick={() => router.push(`/courses/${course.slug}`)}
                              className="hover:bg-blue-50 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="shrink-0 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded group-hover:w-1.5 transition-all"></div>
                                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                  </h3>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {course.startDate ? (
                                  <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>
                                      {format(new Date(course.startDate), 'MMM dd')}
                                      {course.endDate && ` - ${format(new Date(course.endDate), 'MMM dd, yyyy')}`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">TBD</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {course.venue ? (
                                  <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>{course.venue}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">TBD</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {course.price > 0 ? (
                                  <div className="text-base font-semibold text-slate-900">
                                    ${course.price.toLocaleString()}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">Contact for pricing</span>
                                )}
                              </td>
                              {/* <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  onClick={(e) => handleRegisterClick(e, course)}
                                  disabled={loadingCourseData}
                                  className="bg-[#0A3049] hover:bg-blue-700 text-white"
                                  size="sm"
                                >
                                  {loadingCourseData ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    'Register Now'
                                  )}
                                </Button>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3 sm:space-y-4">
                  {paginatedCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-600"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="space-y-3">
                          {/* Title */}
                          <h3 
                            onClick={() => router.push(`/courses/${course.slug}`)}
                            className="text-base sm:text-lg font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {course.title}
                          </h3>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 gap-2 sm:gap-3 text-sm">
                            {/* Date */}
                            {course.startDate && (
                              <div className="flex items-center gap-2 text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-xs sm:text-sm">
                                  {format(new Date(course.startDate), 'MMM dd')}
                                  {course.endDate && ` - ${format(new Date(course.endDate), 'MMM dd, yyyy')}`}
                                </span>
                              </div>
                            )}

                            {/* Venue */}
                            {course.venue && (
                              <div className="flex items-center gap-2 text-slate-700">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-xs sm:text-sm truncate">{course.venue}</span>
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              {course.price > 0 ? (
                                <div className="text-base sm:text-lg font-semibold text-slate-900">
                                  ${course.price.toLocaleString()}
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm text-slate-400">Contact for pricing</span>
                              )}
                              <Button
                                onClick={(e) => handleRegisterClick(e, course)}
                                disabled={loadingCourseData}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                {loadingCourseData ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  'Register Now'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="text-xs sm:text-sm px-3 sm:px-4"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 7) {
                          pageNum = i + 1
                        } else if (currentPage <= 4) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`text-xs sm:text-sm px-2 sm:px-3 ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs sm:text-sm px-3 sm:px-4"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12 sm:py-16">
                <CardContent>
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">No courses found</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters} className="text-sm sm:text-base">Clear All Filters</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CourseFinderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading courses...</p>
          </div>
        </div>
      }
    >
      <CourseFinderPageContent />
    </Suspense>
  )
}
