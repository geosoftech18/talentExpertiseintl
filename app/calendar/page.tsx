'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Filter, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils/slug'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface CourseEvent {
  id: string
  title: string
  date: Date
  duration: string
  venue: string | null
  category: string
  price: number
  seats?: number
  level?: string
  slug: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [courseEvents, setCourseEvents] = useState<CourseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Cache key for sessionStorage
  const CACHE_KEY = 'calendar_cache'
  const CACHE_TIMESTAMP_KEY = 'calendar_cache_timestamp'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Fetch courses from API
  useEffect(() => {
    let cancelled = false

    const fetchCourses = async () => {
      try {
        // Check if we have cached data (only in browser)
        if (typeof window !== 'undefined') {
          const cachedData = sessionStorage.getItem(CACHE_KEY)
          const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY)
          
          if (cachedData && cacheTimestamp) {
            const timestamp = parseInt(cacheTimestamp)
            const now = Date.now()
            
            // Use cached data if it's still fresh (less than 5 minutes old)
            if (now - timestamp < CACHE_DURATION) {
              const parsedData = JSON.parse(cachedData)
              // Convert date strings back to Date objects
              const eventsWithDates = parsedData.map((event: any) => ({
                ...event,
                date: new Date(event.date)
              }))
              if (!cancelled) {
                setCourseEvents(eventsWithDates)
                setLoading(false)
                return // Don't fetch if we have fresh cache
              }
            }
          }
        }

        // No cache or cache expired - fetch fresh data
        setLoading(true)
        // Fetch all courses including expired ones for calendar view
        const response = await fetch('/api/courses?limit=10000&includeExpired=true')
        const result = await response.json()

        if (!cancelled && result.success) {
          // Transform API data to calendar events format
          const events: CourseEvent[] = result.data
            .filter((course: any) => course.startDate) // Only include courses with dates
            .map((course: any) => ({
              id: course.id,
              title: course.title,
              date: new Date(course.startDate),
              duration: course.duration || 'N/A',
              venue: course.venue || null,
              category: course.category || 'Uncategorized',
              price: course.price || 0,
              seats: undefined, // Not available in API response
              level: undefined, // Not available in API response
              slug: course.slug || generateSlug(course.title),
            }))
          
          setCourseEvents(events)
          
          // Cache the data for future navigation (only in browser)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(events))
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
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
                // Convert date strings back to Date objects
                const eventsWithDates = parsedData.map((event: any) => ({
                  ...event,
                  date: new Date(event.date)
                }))
                setCourseEvents(eventsWithDates)
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

    fetchCourses()

    return () => {
      cancelled = true
    }
  }, [])

  // Extract unique categories and venues from fetched courses
  const categories = useMemo(() => {
    return Array.from(new Set(courseEvents.map(e => e.category))).sort()
  }, [courseEvents])

  const venues = useMemo(() => {
    const venueSet = new Set<string>()
    courseEvents.forEach(event => {
      if (event.venue) venueSet.add(event.venue)
    })
    return Array.from(venueSet).sort()
  }, [courseEvents])

  // Generate available years from course events
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    courseEvents.forEach(event => {
      if (event.date instanceof Date && !isNaN(event.date.getTime())) {
        yearSet.add(event.date.getFullYear())
      }
    })
    return Array.from(yearSet).sort((a, b) => b - a) // Latest first
  }, [courseEvents])

  // Sync selected month/year with currentMonth/currentYear when filters change
  useEffect(() => {
    if (selectedMonth !== 'all') {
      setCurrentMonth(parseInt(selectedMonth))
    }
    if (selectedYear !== 'all') {
      setCurrentYear(parseInt(selectedYear))
    }
  }, [selectedMonth, selectedYear])

  const filteredEvents = useMemo(() => {
    return courseEvents.filter((event) => {
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
      if (selectedVenue !== 'all' && event.venue !== selectedVenue) return false
      
      // Filter by month and year
      const eventMonth = event.date instanceof Date ? event.date.getMonth() : -1
      const eventYear = event.date instanceof Date ? event.date.getFullYear() : -1
      
      if (selectedMonth !== 'all' && eventMonth !== parseInt(selectedMonth)) return false
      if (selectedYear !== 'all' && eventYear !== parseInt(selectedYear)) return false
      
      return true
    })
  }, [courseEvents, selectedCategory, selectedVenue, selectedMonth, selectedYear])

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedVenue, selectedMonth, selectedYear])

  const nextMonth = () => {
    let newMonth = currentMonth
    let newYear = currentYear
    
    if (currentMonth === 11) {
      newMonth = 0
      newYear = currentYear + 1
    } else {
      newMonth = currentMonth + 1
    }
    
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    setSelectedMonth(newMonth.toString())
    setSelectedYear(newYear.toString())
  }

  const prevMonth = () => {
    let newMonth = currentMonth
    let newYear = currentYear
    
    if (currentMonth === 0) {
      newMonth = 11
      newYear = currentYear - 1
    } else {
      newMonth = currentMonth - 1
    }
    
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    setSelectedMonth(newMonth.toString())
    setSelectedYear(newYear.toString())
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Training Calendar
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed">
              Explore our comprehensive schedule of professional development courses across multiple locations worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Mobile Filter Toggle Button */}
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
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue} value={venue}>{venue}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
          <Button variant="outline" onClick={prevMonth} className="text-xs sm:text-sm px-3 sm:px-4">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <div className="text-center flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              {months[currentMonth]} {currentYear}
            </h2>
          </div>
          <Button variant="outline" onClick={nextMonth} className="text-xs sm:text-sm px-3 sm:px-4">
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Button>
        </div>

        {/* Course Events List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg text-center py-8 sm:py-12">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Loading courses...</h3>
            <p className="text-sm sm:text-base text-slate-600">Please wait while we fetch the latest training schedules.</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="w-full border-collapse min-w-[800px]">
              <thead className="bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Date</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Course Title</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell">Category</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Duration</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">Venue</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedEvents.map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/courses/${event.slug}`)}
                  >
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                        <span className="text-slate-900 font-medium whitespace-nowrap">
                          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {event.title}
                      </div>
                      <div className="sm:hidden mt-1">
                        <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                        <span>{event.duration}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                      {event.venue ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                          <span className="break-words">{event.venue}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                      <span className="font-bold text-slate-900">${event.price.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination Controls */}
        {!loading && filteredEvents.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-lg p-4">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(endIndex, filteredEvents.length)}</span> of{' '}
              <span className="font-semibold text-slate-900">{filteredEvents.length}</span> courses
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                      className={`text-xs sm:text-sm min-w-[2rem] ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white' 
                          : ''
                      }`}
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
                className="text-xs sm:text-sm"
              >
                Next
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg text-center py-8 sm:py-12">
            <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No courses scheduled</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 px-4">
              There are no courses scheduled for {months[currentMonth]} {currentYear} with the selected filters.
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('all')
                setSelectedVenue('all')
                setSelectedMonth(new Date().getMonth().toString())
                setSelectedYear(new Date().getFullYear().toString())
              }}
              className="text-sm sm:text-base"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

