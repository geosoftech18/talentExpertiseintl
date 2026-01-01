'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { Search, Calendar, MapPin, Clock, X, SlidersHorizontal } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface Course {
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
  // For display purposes
  venue?: string
  startDate?: string
  endDate?: string
  seats?: number
  level?: string
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
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 12
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Cache key for sessionStorage
  const CACHE_KEY = 'courses_cache'
  const CACHE_TIMESTAMP_KEY = 'courses_cache_timestamp'
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
          
          if (cachedData && cacheTimestamp) {
            const timestamp = parseInt(cacheTimestamp)
            const now = Date.now()
            
            // Use cached data if it's still fresh (less than 5 minutes old)
            if (now - timestamp < CACHE_DURATION) {
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
        const coursesResponse = await fetch('/api/courses?limit=1000')

        const coursesResult = await coursesResponse.json()

        if (!cancelled && coursesResult.success) {
          // Courses already have schedule data enriched from API
          setAllCourses(coursesResult.data)
          
          // Cache the data for future navigation (only in browser)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(coursesResult.data))
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

  // Read venue, category, and search from URL params and update when they change
  useEffect(() => {
    const venueParam = searchParams.get('venue')
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
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

  const filteredCourses = useMemo(() => {
    let filtered = allCourses

    // Filter out expired courses - only show upcoming schedules
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
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

    // Duration filter
    if (selectedDuration !== 'all') {
      const days = parseInt(selectedDuration)
      filtered = filtered.filter(course => {
        const courseDays = parseInt(course.duration)
        return courseDays === days
      })
    }

    // Sort - Always sort by date first (earliest first), then by selected sort option
    filtered.sort((a, b) => {
      // Primary sort: by date (earliest first)
      const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity
      const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity
      const dateDiff = aDate - bDate
      
      // If dates are the same (or both missing), apply secondary sort
      if (dateDiff === 0 || (aDate === Infinity && bDate === Infinity)) {
        // Secondary sort based on selected option
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          case 'rating':
            return (b.rating || 0) - (a.rating || 0)
          case 'name':
            return a.title.localeCompare(b.title)
          default:
            // Relevance: featured first, then trending, then by rating
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            if (a.trending && !b.trending) return -1
            if (!a.trending && b.trending) return 1
            return (b.rating || 0) - (a.rating || 0)
        }
      }
      
      return dateDiff
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedVenue, selectedDuration, sortBy, allCourses])

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
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedVenue !== 'all',
    selectedDuration !== 'all',
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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

                  {/* Duration Filter */}
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                      Duration
                    </Label>
                    <Select value={selectedDuration} onValueChange={(value) => { setSelectedDuration(value); setCurrentPage(1) }}>
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="All Durations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Durations</SelectItem>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="2">2 Days</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="4">4 Days</SelectItem>
                        <SelectItem value="5">5 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 block">
                      Sort By
                    </Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="date">Date: Earliest First</SelectItem>
                      </SelectContent>
                    </Select>
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
                              Reference Code
                            </th>
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
                              Duration
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
                                {course.courseCode ? (
                                  <span className="text-sm font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                    {course.courseCode}
                                  </span>
                                ) : (
                                  <span className="text-sm text-slate-400">-</span>
                                )}
                              </td>
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
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{course.duration}</span>
                                </div>
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
                      onClick={() => router.push(`/courses/${course.slug}`)}
                      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-600"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="space-y-3">
                          {/* Course Code */}
                          {course.courseCode && (
                            <div>
                              <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                {course.courseCode}
                              </span>
                            </div>
                          )}
                          
                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 line-clamp-2">
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

                            {/* Duration */}
                            <div className="flex items-center gap-2 text-slate-700">
                              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-xs sm:text-sm">{course.duration} Days</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              {course.price > 0 ? (
                                <div className="text-base sm:text-lg font-semibold text-slate-900">
                                  ${course.price.toLocaleString()}
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm text-slate-400">Contact for pricing</span>
                              )}
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
