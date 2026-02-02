'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Venue {
  id: string
  city: string
  country: string
  image: string
  imageLoading?: boolean
}

// Cache for Wikipedia images to avoid duplicate API calls
const wikipediaImageCache = new Map<string, string>()

// Helper function to clean city name by removing hyphens and suffixes
const cleanCityName = (city: string): string => {
  // Remove everything after hyphen (e.g., "Madrid-SP" -> "Madrid")
  // Also handle cases with multiple hyphens
  const cleaned = city.trim().split('-')[0].trim()
  
  // Remove any trailing numbers or codes (e.g., "Tokyo1" -> "Tokyo")
  // But keep spaces and normal city names
  return cleaned
}

// Function to get Wikipedia image URL for a city
const getWikipediaImageUrl = async (city: string, country: string): Promise<string> => {
  const cacheKey = `${city}, ${country}`.toLowerCase()
  
  // Check cache first
  if (wikipediaImageCache.has(cacheKey)) {
    return wikipediaImageCache.get(cacheKey)!
  }
  
  // Default placeholder image
  const defaultImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Wikipedia-logo-v2-en.svg/1200px-Wikipedia-logo-v2-en.svg.png'
  
  // Clean city name to remove hyphens and suffixes
  const cleanedCity = cleanCityName(city)
  
  try {
    // Try cleaned city name first (without hyphen suffix)
    let cityName = encodeURIComponent(cleanedCity)
    let apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`
    
    let response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    // If cleaned city not found, try original city name (with hyphen)
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
    
    // If city not found, try "City, Country" format with cleaned city
    if (!response.ok) {
      const cityCountryName = encodeURIComponent(`${cleanedCity}, ${country}`.trim())
      apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityCountryName}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
    }
    
    // If still not found, try original "City, Country" format
    if (!response.ok && cleanedCity !== city.trim()) {
      const cityCountryName = encodeURIComponent(`${city}, ${country}`.trim())
      apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityCountryName}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
    }
    
    // If still not found, try country name
    if (!response.ok) {
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
      
      // Prefer originalimage, fallback to thumbnail, then default
      let imageUrl = data.originalimage?.source || data.thumbnail?.source || defaultImage
      
      // If thumbnail, try to get higher resolution version
      if (imageUrl && imageUrl.includes('/thumb/')) {
        // Convert thumbnail URL to full size (remove /thumb/ and size suffix)
        imageUrl = imageUrl.replace(/\/thumb\//, '/').replace(/\/\d+px-.*$/, '')
      }
      
      // Cache the result
      wikipediaImageCache.set(cacheKey, imageUrl)
      return imageUrl
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia image for ${city}, ${country}:`, error)
  }
  
  // Cache default image to avoid repeated failed requests
  wikipediaImageCache.set(cacheKey, defaultImage)
  return defaultImage
}

// Function to get Wikipedia image URL synchronously (returns placeholder, will be updated)
const getCityImageUrl = (city: string, country: string): string => {
  const cacheKey = `${city}, ${country}`.toLowerCase()
  
  // Return cached image if available
  if (wikipediaImageCache.has(cacheKey)) {
    return wikipediaImageCache.get(cacheKey)!
  }
  
  // Return placeholder that will be replaced when image loads
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Wikipedia-logo-v2-en.svg/1200px-Wikipedia-logo-v2-en.svg.png`
}

export default function ChooseVenueSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const isPausedRef = useRef(false)
  const autoScrollRef = useRef<{ pause: () => void; resume: () => void } | null>(null)

  // Fetch venues from API and Wikipedia images
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (result.success) {
          // Filter only active venues and map to our format
          const activeVenues = result.data
            .filter((v: any) => v.status === 'Active')
            .map((v: any) => ({
              id: String(v.id),
              city: v.city || '',
              country: v.country || '',
              image: getCityImageUrl(v.city || '', v.country || ''),
              imageLoading: true
            }))
            .filter((v: Venue) => v.city && v.country) // Only include venues with both city and country
          
          setVenues(activeVenues)
          
          // Fetch Wikipedia images for all venues
          const imagePromises = activeVenues.map(async (venue: Venue) => {
            try {
              const imageUrl = await getWikipediaImageUrl(venue.city, venue.country)
              return { id: venue.id, image: imageUrl }
            } catch (error) {
              console.error(`Error fetching image for ${venue.city}:`, error)
              return { id: venue.id, image: venue.image }
            }
          })
          
          const imageResults = await Promise.all(imagePromises)
          
          // Update venues with fetched images
          setVenues(prevVenues => 
            prevVenues.map(venue => {
              const imageResult = imageResults.find(r => r.id === venue.id)
              return {
                ...venue,
                image: imageResult?.image || venue.image,
                imageLoading: false
              }
            })
          )
        }
      } catch (err) {
        console.error('Error fetching venues:', err)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  // Auto-scroll animation - only runs when venues are loaded
  useEffect(() => {
    if (loading || venues.length === 0) return

    const carousel = carouselRef.current
    if (!carousel) return

    let animationFrameId: number
    let scrollPosition = 0
    let originalWidth = 0
    let itemWidth = 0
    const scrollSpeed = 0.8 // pixels per frame for smooth animation

    const initAnimation = () => {
      // Wait for images to load and DOM to be ready
      const items = carousel.querySelectorAll('[data-venue-item]:not([data-venue-item="clone"])')
      if (items.length === 0) {
        // Retry if items not ready yet
        setTimeout(initAnimation, 100)
        return
      }

      // Get actual item width including gap
      const firstItem = items[0] as HTMLElement
      if (!firstItem.offsetWidth || firstItem.offsetWidth === 0) {
        // Retry if width not calculated yet
        setTimeout(initAnimation, 100)
        return
      }

      itemWidth = firstItem.offsetWidth + 24 // 24px gap (gap-6)

      // Clear any existing clones
      const existingClones = carousel.querySelectorAll('[data-venue-item="clone"]')
      existingClones.forEach(clone => clone.remove())

      // Duplicate items for seamless loop
      const itemsArray = Array.from(items)
      itemsArray.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement
        clone.setAttribute('data-venue-item', 'clone')
        carousel.appendChild(clone)
      })

      originalWidth = itemsArray.length * itemWidth

      // Disable smooth scrolling for programmatic control
      carousel.style.scrollBehavior = 'auto'
      carousel.scrollLeft = 0
      scrollPosition = 0

      const animate = () => {
        if (!isPausedRef.current) {
          scrollPosition += scrollSpeed
          
          // Reset scroll position when we've scrolled past all original items
          if (scrollPosition >= originalWidth) {
            scrollPosition = scrollPosition - originalWidth
          }
          
          carousel.scrollLeft = scrollPosition
        }
        animationFrameId = requestAnimationFrame(animate)
      }

      // Store pause/resume functions with sync capability
      autoScrollRef.current = {
        pause: () => {
          isPausedRef.current = true
          // Sync scrollPosition with actual scroll position when pausing
          scrollPosition = carousel.scrollLeft
        },
        resume: () => {
          isPausedRef.current = false
          // Sync scrollPosition with actual scroll position when resuming
          scrollPosition = carousel.scrollLeft
        }
      }

      // Start animation
      animationFrameId = requestAnimationFrame(animate)
    }

    // Initialize after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initAnimation, 300)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [loading, venues.length])

  // Handle manual scroll - pause auto-scroll temporarily
  const handleManualScroll = () => {
    if (autoScrollRef.current) {
      autoScrollRef.current.pause()
    }
  }

  // Navigation handlers
  const scrollLeft = () => {
    const carousel = carouselRef.current
    if (!carousel) return
    
    // Pause auto-scroll
    handleManualScroll()
    
    // Temporarily enable smooth scrolling for manual navigation
    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = 'smooth'
    
    const itemWidth = 300 + 24 // 300px card + 24px gap
    const scrollAmount = -itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    
    // Restore auto scroll behavior and resume after scroll completes
    setTimeout(() => {
      carousel.style.scrollBehavior = originalScrollBehavior
      if (autoScrollRef.current) {
        autoScrollRef.current.resume()
      }
    }, 1000) // Wait for smooth scroll to complete
  }

  const scrollRight = () => {
    const carousel = carouselRef.current
    if (!carousel) return
    
    // Pause auto-scroll
    handleManualScroll()
    
    // Temporarily enable smooth scrolling for manual navigation
    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = 'smooth'
    
    const itemWidth = 300 + 24 // 300px card + 24px gap
    const scrollAmount = itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    
    // Restore auto scroll behavior and resume after scroll completes
    setTimeout(() => {
      carousel.style.scrollBehavior = originalScrollBehavior
      if (autoScrollRef.current) {
        autoScrollRef.current.resume()
      }
    }, 1000) // Wait for smooth scroll to complete
  }

  // Handle venue card click
  const handleVenueClick = (city: string, country: string) => {
    // Format venue as "City, Country" to match the courses page filter format
    const venueFilter = `${city}, ${country}`
    router.push(`/courses/venue/${encodeURIComponent(venueFilter)}`)
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Venue
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select from our global network of world-class training locations
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading venues...</p>
          </div>
        )}

        {/* Carousel Container */}
        {!loading && venues.length > 0 && (
          <div className="relative overflow-hidden group/container">
            {/* Left Navigation Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </Button>

            {/* Right Navigation Arrow */}
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </Button>

            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-hidden"
              onMouseEnter={() => autoScrollRef.current?.pause()}
              onMouseLeave={() => {
                setTimeout(() => {
                  autoScrollRef.current?.resume()
                }, 500)
              }}
              onTouchStart={() => autoScrollRef.current?.pause()}
              onTouchEnd={() => {
                setTimeout(() => {
                  autoScrollRef.current?.resume()
                }, 3000)
              }}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {venues.map((venue) => (
              <div
                key={venue.id}
                data-venue-item
                className="flex-shrink-0 w-[280px] sm:w-[300px]"
              >
                <Card 
                  className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleVenueClick(venue.city, venue.country)}
                >
                  {/* Image Container */}
                  <div className="relative h-[180px] sm:h-[200px] overflow-hidden bg-slate-200">
                    {venue.imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                        <div className="animate-pulse text-slate-400 text-xs">Loading image...</div>
                      </div>
                    )}
                    <Image
                      src={venue.image}
                      alt={`${venue.city}, ${venue.country}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 280px, 300px"
                      quality={95}
                      priority={false}
                      onError={(e) => {
                        // Fallback to a default placeholder if image fails to load
                        const target = e.currentTarget as HTMLImageElement
                        target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Wikipedia-logo-v2-en.svg/1200px-Wikipedia-logo-v2-en.svg.png'
                      }}
                    />
                    
                    {/* Venue Name - Solid background for readability */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">
                        {venue.city}
                      </h3>
                      <p className="text-sm font-medium text-white/95 drop-shadow-md">
                        {venue.country}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              ))}
            </div>

            {/* Hide scrollbar */}
            <style jsx global>{`
              [data-venue-carousel]::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        )}

        {/* Empty State */}
        {!loading && venues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No venues available at the moment.</p>
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="/venues"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <span>View All Venues</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

