'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [courseEvents, setCourseEvents] = useState<CourseEvent[]>([])
  const [loading, setLoading] = useState(true)

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
        // Fetch all courses - optimized API now returns all schedules efficiently
        const response = await fetch('/api/courses?limit=1000')
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
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Training Calendar
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Explore our comprehensive schedule of professional development courses across multiple locations worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-700">Filters:</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              {months[currentMonth]} {currentYear}
            </h2>
          </div>
          <Button variant="outline" onClick={nextMonth}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Course Events List */}
        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading courses...</h3>
              <p className="text-slate-600">Please wait while we fetch the latest training schedules.</p>
            </CardContent>
          </Card>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{event.category}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">${event.price.toLocaleString()}</div>
                      {event.seats !== undefined && (
                        <div className="text-xs text-slate-500">{event.seats} seats left</div>
                      )}
                    </div>
                  </div>

                  <Link href={`/courses/${event.slug}`}>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                      {event.title}
                    </h3>
                  </Link>

                  <div className="space-y-2 mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.duration}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Link href={`/courses/${event.slug}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/courses/${event.slug}`}>
                        Register
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses scheduled</h3>
              <p className="text-slate-600 mb-6">
                There are no courses scheduled for {months[currentMonth]} {currentYear} with the selected filters.
              </p>
              <Button onClick={() => {
                setSelectedCategory('all')
                setSelectedVenue('all')
                setSelectedMonth(new Date().getMonth().toString())
                setSelectedYear(new Date().getFullYear().toString())
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

