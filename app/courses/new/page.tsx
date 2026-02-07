'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { Search, Calendar, MapPin, Clock, X, SlidersHorizontal, Loader2, Filter, Award, Building2, CalendarDays, Tag } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

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

function NewProgramsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [allCourses, setAllCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVenue, setSelectedVenue] = useState('all')
  const [selectedCertificate, setSelectedCertificate] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [availableCertificates, setAvailableCertificates] = useState<Certificate[]>([])
  const [loadingCertificates, setLoadingCertificates] = useState(true)

  const CACHE_KEY = 'new_programs_cache'
  const CACHE_TIMESTAMP_KEY = 'new_programs_cache_timestamp'
  const CACHE_VERSION_KEY = 'new_programs_cache_version'
  const CACHE_VERSION = '1.3' // Updated version to force cache refresh
  const CACHE_DURATION = 30 * 1000 // 30 seconds (reduced for faster updates when toggle changes)

  // Fetch courses from database (filtered by isNewProgram)
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
            
            // Use cached data if it's still fresh (less than 30 seconds old) and version matches
            if (now - timestamp < CACHE_DURATION && cacheVersion === CACHE_VERSION) {
              const parsedData = JSON.parse(cachedData)
              if (!cancelled) {
                setAllCourses(parsedData)
                setLoading(false)
                return // Don't fetch if we have fresh cache
              }
            } else {
              // Cache expired or version mismatch - clear it
              sessionStorage.removeItem(CACHE_KEY)
              sessionStorage.removeItem(CACHE_TIMESTAMP_KEY)
            }
          }
        }

        // No cache or cache expired - fetch fresh data
        setLoading(true)
        // Fetch new programs only (isNewProgram = true)
        // Add timestamp to prevent browser caching issues
        const timestamp = Date.now()
        const coursesResponse = await fetch(`/api/courses?limit=10000&includeExpired=true&newPrograms=true&_t=${timestamp}`, {
          cache: 'no-store', // Prevent browser caching
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

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
        const response = await fetch('/api/admin/certificates?limit=1000')
        const result = await response.json()
        
        if (result.success) {
          const activeCertificates = result.data
            .filter((cert: Certificate) => cert.status === 'Active')
            .sort((a: Certificate, b: Certificate) => a.name.localeCompare(b.name))
          setAvailableCertificates(activeCertificates)
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
      } finally {
        setLoadingCertificates(false)
      }
    }

    fetchCertificates()
  }, [])

  // Get unique categories, venues, years, and months from courses
  const { categories, availableVenues, availableYears, availableMonths } = useMemo(() => {
    const cats = new Set<string>()
    const venues = new Set<string>()
    const years = new Set<number>()
    const months = new Set<number>()

    allCourses.forEach((course) => {
      if (course.category) cats.add(course.category)
      if (course.venue) venues.add(course.venue)
      if (course.startDate) {
        const date = new Date(course.startDate)
        years.add(date.getFullYear())
        months.add(date.getMonth() + 1)
      }
    })

    return {
      categories: Array.from(cats).sort(),
      availableVenues: Array.from(venues).sort(),
      availableYears: Array.from(years).sort((a, b) => b - a),
      availableMonths: Array.from(months).sort((a, b) => a - b),
    }
  }, [allCourses])

  const monthNames: { [key: number]: string } = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December',
  }

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      // Category filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false
      }

      // Venue filter
      if (selectedVenue !== 'all' && course.venue !== selectedVenue) {
        return false
      }

      // Certificate filter
      if (selectedCertificate !== 'all') {
        if (!course.certificateIds || !course.certificateIds.includes(selectedCertificate)) {
          return false
        }
      }

      // Year filter
      if (selectedYear !== 'all' && course.startDate) {
        const courseYear = new Date(course.startDate).getFullYear()
        if (courseYear.toString() !== selectedYear) {
          return false
        }
      }

      // Month filter
      if (selectedMonth !== 'all' && course.startDate) {
        const courseMonth = new Date(course.startDate).getMonth() + 1
        if (courseMonth.toString() !== selectedMonth) {
          return false
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.courseCode?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower) ||
          course.venue?.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false
        }
      }

      // Only show non-expired courses
      if (course.startDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const courseDate = new Date(course.startDate)
        courseDate.setHours(0, 0, 0, 0)
        if (courseDate < today) {
          return false
        }
      }

      return true
    })
  }, [allCourses, selectedCategory, selectedVenue, selectedCertificate, selectedYear, selectedMonth, searchTerm])

  // Pagination
  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCourses.slice(start, start + itemsPerPage)
  }, [filteredCourses, currentPage])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== 'all') count++
    if (selectedVenue !== 'all') count++
    if (selectedCertificate !== 'all') count++
    if (selectedYear !== 'all') count++
    if (selectedMonth !== 'all') count++
    return count
  }, [selectedCategory, selectedVenue, selectedCertificate, selectedYear, selectedMonth])

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedVenue('all')
    setSelectedCertificate('all')
    setSelectedYear('all')
    setSelectedMonth('all')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">New Programs</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Discover our latest and featured training programs
          </p>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-11 bg-white border-slate-300 focus:border-primary focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden border-slate-300"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Same as courses page */}
          <aside className={`w-full lg:w-80 lg:shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="shadow-xl border-2 border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 lg:sticky lg:top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A3049] to-[#0A3049] px-4 sm:px-6 py-4 border-b border-blue-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Filters</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-white text-blue-700 border-0 shadow-md font-semibold text-xs px-2.5 py-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="pt-2 sm:pt-2 pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      Category
                    </Label>
                    <div className="border border-slate-300 rounded-lg p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1) }}>
                        <SelectTrigger className="w-full h-10 sm:h-11 border-0 shadow-none focus:ring-2 focus:ring-blue-500/20 bg-transparent">
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
                  </div>

                  <div className="border-t border-slate-200"></div>

                  {/* Venue Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Venue
                    </Label>
                    <div className="border border-slate-300 rounded-lg p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Select value={selectedVenue} onValueChange={(value) => { setSelectedVenue(value); setCurrentPage(1) }}>
                        <SelectTrigger className="w-full h-10 sm:h-11 border-0 shadow-none focus:ring-2 focus:ring-blue-500/20 bg-transparent">
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
                  </div>

                  <div className="border-t border-slate-200"></div>

                  {/* Certificate Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      Certificate
                    </Label>
                    <div className="border border-slate-300 rounded-lg p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Select 
                        value={selectedCertificate} 
                        onValueChange={(value) => { setSelectedCertificate(value); setCurrentPage(1) }}
                        disabled={loadingCertificates}
                      >
                        <SelectTrigger className="w-full h-10 sm:h-11 border-0 shadow-none focus:ring-2 focus:ring-blue-500/20 bg-transparent disabled:opacity-60">
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
                  </div>

                  <div className="border-t border-slate-200"></div>

                  {/* Date Filters Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <Label className="text-xs sm:text-sm font-semibold text-slate-800">
                        Date Filters
                      </Label>
                    </div>
                    
                    {/* Year Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                        Year
                      </Label>
                      <div className="border border-slate-300 rounded-lg p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setCurrentPage(1) }}>
                          <SelectTrigger className="w-full h-10 sm:h-11 border-0 shadow-none focus:ring-2 focus:ring-blue-500/20 bg-transparent">
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
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                        Month
                      </Label>
                      <div className="border border-slate-300 rounded-lg p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value); setCurrentPage(1) }}>
                          <SelectTrigger className="w-full h-10 sm:h-11 border-0 shadow-none focus:ring-2 focus:ring-blue-500/20 bg-transparent">
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
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <>
                      <div className="border-t border-slate-200 pt-3"></div>
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full text-sm h-10 sm:h-11 border-2 border-slate-300 hover:border-red-400 hover:bg-red-50 hover:text-red-700 font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </>
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
                <span className="font-semibold text-slate-900">{filteredCourses.length}</span> new programs
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
                  <p className="text-sm sm:text-base text-slate-600 mt-4">Loading new programs...</p>
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
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{course.venue || 'TBD'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-slate-900">
                                  {course.price ? `$${course.price.toLocaleString()}` : 'Contact'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {paginatedCourses.map((course) => (
                    <Card 
                      key={course.id} 
                      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/courses/${course.slug}`)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                            <p className="text-xs text-slate-500 mb-2">{course.courseCode}</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center text-slate-700">
                              <Tag className="w-4 h-4 mr-1 text-slate-400" />
                              {course.category}
                            </div>
                            <div className="flex items-center text-slate-700">
                              <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                              {course.venue || 'TBD'}
                            </div>
                            {course.startDate && (
                              <div className="flex items-center text-slate-700">
                                <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                                <span className="text-xs sm:text-sm">
                                  {format(new Date(course.startDate), 'MMM dd')}
                                  {course.endDate && ` - ${format(new Date(course.endDate), 'MMM dd, yyyy')}`}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center text-slate-700">
                              <Clock className="w-4 h-4 mr-1 text-slate-400" />
                              {course.duration}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-lg font-semibold text-slate-900">
                              {course.price ? `$${course.price.toLocaleString()}` : 'Contact'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12 sm:py-16">
                <CardContent>
                  <p className="text-lg font-medium text-slate-900 mb-2">No new programs found</p>
                  <p className="text-sm text-slate-600">
                    {searchTerm || activeFiltersCount > 0
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for new programs'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewProgramsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewProgramsPageContent />
    </Suspense>
  )
}

