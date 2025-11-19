"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UpcomingProgram {
  id: string
  scheduleId: string
  programId: string
  slug: string
  courseCode: string  // API returns courseCode, not refCode
  title: string       // API returns title, not programName
  startDate: string
  endDate: string | null
  venue: string
  price: number       // API returns price, not fee
}

export default function UpcomingProgramsSection() {
  const router = useRouter()
  const [programs, setPrograms] = useState<UpcomingProgram[]>([])
  const [loading, setLoading] = useState(true)

  // Cache keys for upcoming schedules
  const CACHE_KEY = 'upcoming_schedules_cache'
  const CACHE_TIMESTAMP_KEY = 'upcoming_schedules_cache_timestamp'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Process and sort programs - show all schedules, no deduplication
  const processPrograms = (data: any[]): UpcomingProgram[] => {
    // Filter out any invalid entries and ensure all have startDate
    const validSchedules = data.filter((item) => item.startDate)
    
    // Sort by earliest start date first (ascending order)
    const sortedPrograms = [...validSchedules].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return dateA - dateB // Ascending order (earliest first)
    })
    
    // Return the 10 earliest schedules (all schedules are shown, no deduplication)
    return sortedPrograms.slice(0, 10)
  }

  useEffect(() => {
    let cancelled = false

    const fetchUpcomingPrograms = async () => {
      try {
        // First, try to use cached data (only in browser)
        if (typeof window !== 'undefined') {
          const cachedData = sessionStorage.getItem(CACHE_KEY)
          const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY)
          
          if (cachedData && cacheTimestamp) {
            const timestamp = parseInt(cacheTimestamp)
            const now = Date.now()
            
            // Use cached data if it's still fresh (less than 5 minutes old)
            if (now - timestamp < CACHE_DURATION) {
              try {
                const parsedData = JSON.parse(cachedData)
                if (!cancelled) {
                  setPrograms(parsedData)
                  setLoading(false)
                  return // Don't fetch if we have fresh cache
                }
              } catch (e) {
                // If cache parse fails, continue to fetch
                console.warn('Failed to parse cached data, fetching fresh data')
              }
            }
          }
        }

        // No cache or cache expired - fetch fresh data from schedules API (all schedules, no deduplication)
        setLoading(true)
        const response = await fetch('/api/schedules?limit=100')
        const result = await response.json()
        
        if (!cancelled && result.success && result.data) {
          const processedPrograms = processPrograms(result.data)
          
          // Cache the processed data (only in browser)
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(processedPrograms))
              sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
            } catch (e) {
              // If storage quota exceeded, just continue without caching
              console.warn('Failed to cache data, continuing without cache')
            }
          }
          
          setPrograms(processedPrograms)
        } else if (!cancelled) {
          console.error('API response error:', result)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching upcoming programs:', error)
          
          // Try to use cached data even if expired as fallback (only in browser)
          if (typeof window !== 'undefined') {
            const cachedData = sessionStorage.getItem(CACHE_KEY)
            if (cachedData) {
              try {
                const parsedData = JSON.parse(cachedData)
                setPrograms(parsedData)
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

    fetchUpcomingPrograms()

    return () => {
      cancelled = true
    }
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch {
      return dateString
    }
  }

  const formatFee = (price: number) => {
    return `$ ${price.toLocaleString()}`
  }

  const handleRegister = (program: UpcomingProgram) => {
    router.push(`/courses/${program.slug}`)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-4">
            Upcoming Programs
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore our scheduled training programs and secure your spot today
          </p>
        </div>

        {/* Programs Table */}
        {loading ? (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-slate-600 mt-4">Loading programs...</p>
              </div>
            </CardContent>
          </Card>
        ) : programs.length > 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-900 hover:bg-blue-900">
                      <TableHead className="text-white font-semibold px-6 py-4">Ref No.</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4">Program Name</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4">Starts</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4">Ends</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4">Venue</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4">Fees</TableHead>
                      <TableHead className="text-white font-semibold px-6 py-4 text-center">Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program, index) => (
                      <TableRow
                        key={program.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700">
                            {program.courseCode || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900 leading-relaxed">
                            {program.title || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {formatDate(program.startDate)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {program.endDate ? formatDate(program.endDate) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {program.venue || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900">
                            {program.price > 0 ? formatFee(program.price) : 'Contact for pricing'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Button
                            onClick={() => handleRegister(program)}
                            size="sm"
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-md px-4 py-2"
                          >
                            Register Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No upcoming programs available at the moment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Programs Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push('/courses')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            All Programs
          </Button>
        </div>
      </div>
    </section>
  )
}

