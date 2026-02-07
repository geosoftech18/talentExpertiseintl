"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Calendar, MapPin, DollarSign, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
// Registration form is now on a dedicated page
// Course types no longer needed for modal

interface UpcomingProgram {
  id: string
  scheduleId: string
  programId: string
  slug: string
  courseCode: string
  title: string
  startDate: string
  endDate: string | null
  venue: string
  price: number
}

export default function UpcomingProgramsCarousel() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [programs, setPrograms] = useState<UpcomingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [isHovered, setIsHovered] = useState(false)

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

  const handleCardClick = (program: UpcomingProgram) => {
    router.push(`/courses/${program.slug}`)
  }

  // Registration now navigates to dedicated page, no need for this handler

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || programs.length === 0) return

    const scrollInterval = setInterval(() => {
      if (!isHovered) {
        if (api.canScrollNext()) {
          api.scrollNext()
        } else {
          // Loop back to the beginning
          api.scrollTo(0)
        }
      }
    }, 4000) // Auto-scroll every 4 seconds

    return () => clearInterval(scrollInterval)
  }, [api, isHovered, programs.length])

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-5xl font-bold text-[#0A3049] mb-4">
            Upcoming Programs
          </h2>
          <p className="md:text-xl text-lg text-slate-600 max-w-3xl mx-auto">
            Explore our scheduled training programs and secure your spot today
          </p>
        </div>

        {/* Programs Carousel */}
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
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {programs.map((program) => (
                  <CarouselItem key={program.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4">
                    <Card 
                      className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 cursor-pointer"
                      onClick={() => handleCardClick(program)}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Ref Code Badge */}
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {program.courseCode || 'N/A'}
                          </span>
                        </div>

                        {/* Program Title */}
                        <h3 className="text-lg font-bold text-[#0A3049] mb-4 line-clamp-2 min-h-[3.5rem]">
                          {program.title}
                        </h3>

                        {/* Program Details */}
                        <div className="space-y-3 mb-6 flex-grow">
                          {/* Date */}
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium text-slate-700">Date</div>
                              <div className="text-slate-600">
                                {program.startDate ? (
                                  <>
                                    {format(new Date(program.startDate), 'MMM dd')}
                                    {program.endDate && ` - ${format(new Date(program.endDate), 'MMM dd, yyyy')}`}
                                  </>
                                ) : (
                                  'TBD'
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Venue */}
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium text-slate-700">Venue</div>
                              <div className="text-slate-600">{program.venue || 'TBD'}</div>
                            </div>
                          </div>

                          {/* Fees */}
                          <div className="flex items-start gap-2">
                            <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium text-slate-700">Fees</div>
                              <div className="text-slate-900 font-semibold">
                                {program.price > 0 ? formatFee(program.price) : 'Contact for pricing'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Register Now Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent card click
                            const isAuthenticated = status === "authenticated" && !!session?.user
                            if (isAuthenticated) {
                              // User is logged in - navigate to registration page
                              let scheduleIdParam = ''
                              if (program.scheduleId) {
                                scheduleIdParam = `?scheduleId=${program.scheduleId}`
                              }
                              router.push(`/courses/${program.slug}/register${scheduleIdParam}`)
                            } else {
                              // User is not logged in - redirect to checkout page
                              let scheduleIdParam = ''
                              if (program.scheduleId) {
                                scheduleIdParam = `?scheduleId=${program.scheduleId}`
                              }
                              router.push(`/courses/${program.slug}/checkout${scheduleIdParam}`)
                            }
                          }}
                          className="w-full bg-[#0A3049] hover:bg-[#0A3049]/90 text-white font-semibold"
                        >
                          Register Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>
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
            className="bg-[#0A3049] hover:bg-[#0A3049]/90 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            All Programs
          </Button>
        </div>
      </div>
    </section>
  )
}

