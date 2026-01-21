'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Filter, X, Loader2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { generateSlug } from '@/lib/utils/slug'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

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

export default function CategoryCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const categorySlug = params.slug as string
  const categoryName = decodeURIComponent(categorySlug)

  const [allCourses, setAllCourses] = useState<CourseListItem[]>([])
  const [availableCertificates, setAvailableCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCertificates, setLoadingCertificates] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [selectedCertificate, setSelectedCertificate] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

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

  // Filter courses by category and exclude expired courses
  const categoryCourses = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
    return allCourses.filter(course => {
      // Must match category
      if (course.category !== categoryName) return false
      
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
  }, [allCourses, categoryName])

  // Extract unique values for filters
  const availableVenues = useMemo(() => {
    return Array.from(new Set(categoryCourses.map(c => c.venue).filter(Boolean))).sort() as string[]
  }, [categoryCourses])

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    categoryCourses.forEach(course => {
      if (course.startDate) {
        const year = new Date(course.startDate).getFullYear()
        yearSet.add(year)
      }
    })
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [categoryCourses])

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...categoryCourses]

    if (selectedVenue !== 'all') {
      filtered = filtered.filter(course => course.venue === selectedVenue)
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
  }, [categoryCourses, selectedVenue, selectedCertificate, selectedMonth, selectedYear])

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedVenue, selectedCertificate, selectedMonth, selectedYear])

  const resetFilters = () => {
    setSelectedVenue('all')
    setSelectedCertificate('all')
    setSelectedMonth('all')
    setSelectedYear('all')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-white border-blue-400/30 mb-6">
              Category
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {categoryName}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed">
              Explore our comprehensive range of {categoryName.toLowerCase()} training courses designed to enhance your professional skills.
            </p>
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
            
            <Select value={selectedVenue} onValueChange={(value) => { setSelectedVenue(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10">
                <SelectValue placeholder="All Venues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                {availableVenues.map((venue) => (
                  <SelectItem key={venue} value={venue}>{venue}</SelectItem>
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
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Venue</th>
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
                      <td className="px-4 py-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                        {course.venue ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{course.venue}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">TBD</span>
                        )}
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
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-sm text-slate-600">
              No courses available for {categoryName} with the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

