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
}

// Hash function to generate consistent hash from string
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Collection of high-quality Unsplash image IDs for cityscapes/landmarks
const unsplashImageIds = [
  '1512453979798-5ea266f8880c', // Dubai
  '1578662996442-48f60103fc96', // Cityscape
  '1513635269975-59663e0ac1ad', // London
  '1596422846543-75c6fc197f07', // Kuala Lumpur
  '1587474260584-136574028703', // New Delhi
  '1496442226666-8d4d0e62e6e9', // New York
  '1523059623039-a9ed027e7fad', // Nairobi
  '1502602898657-3e91760cbb34', // Paris
  '1449824913935-59a10b8d2000', // Cityscape
  '1477959858617-67f85cf4f1df', // Cityscape
  '1469854523086-cc02fe5d8800', // Cityscape
  '1480714378408-67cf0d13bc1b', // Cityscape
  '1506905925346-21bda4d32df4', // Cityscape
  '1514565131-fce0801e5785', // Cityscape
  '1502602898536-47eb22548b3b', // Cityscape
  '1514565131-fce0801e5785', // Cityscape
  '1449824913935-59a10b8d2000', // Cityscape
  '1477959858617-67f85cf4f1df', // Cityscape
  '1469854523086-cc02fe5d8800', // Cityscape
  '1480714378408-67cf0d13bc1b', // Cityscape
  '1506905925346-21bda4d32df4', // Cityscape
  '1514565131-fce0801e5785', // Cityscape
  '1502602898536-47eb22548b3b', // Cityscape
  '1449824913935-59a10b8d2000', // Cityscape
  '1477959858617-67f85cf4f1df', // Cityscape
  '1469854523086-cc02fe5d8800', // Cityscape
  '1480714378408-67cf0d13bc1b', // Cityscape
  '1506905925346-21bda4d32df4', // Cityscape
  '1514565131-fce0801e5785', // Cityscape
  '1502602898536-47eb22548b3b', // Cityscape
]

// Map of known cities to specific Unsplash image IDs for better quality
const cityImageMap: { [key: string]: string } = {
  'Dubai': '1512453979798-5ea266f8880c',
  'Abuja': '1578662996442-48f60103fc96',
  'London': '1513635269975-59663e0ac1ad',
  'Kuala Lumpur': '1596422846543-75c6fc197f07',
  'New Delhi': '1587474260584-136574028703',
  'New York': '1496442226666-8d4d0e62e6e9',
  'Nairobi': '1523059623039-a9ed027e7fad',
  'Paris': '1502602898657-3e91760cbb34',
  'Singapore': '1525625293377-297ff1838b2d',
  'Bangkok': '1552465014-bf7e97f20ab2',
  'Hong Kong': '1525625293377-297ff1838b2d',
  'Tokyo': '1540959733332-6abbd3f60f67',
  'Sydney': '1506905925346-21bda4d32df4',
  'Toronto': '1514565131-fce0801e5785',
  'Mumbai': '1587474260584-136574028703',
  'Barcelona': '1502602898536-47eb22548b3b',
  'Rome': '1515542622366-27f52759c930',
  'Amsterdam': '1534351590666-13e3e2b0a8c8',
  'Berlin': '1469854523086-cc02fe5d8800',
  'Madrid': '1539037116277-4b91258ad7f3',
  'Vienna': '1514565131-fce0801e5785',
  'Prague': '1541432901042-2d8bd35b38a3',
  'Istanbul': '1524231757912-21f17c2b6f79',
  'Cairo': '1578662996442-48f60103fc96',
  'Cape Town': '1506905925346-21bda4d32df4',
  'Johannesburg': '1523059623039-a9ed027e7fad',
  'Lagos': '1578662996442-48f60103fc96',
  'Accra': '1578662996442-48f60103fc96',
  'Casablanca': '1502602898536-47eb22548b3b',
  'Riyadh': '1512453979798-5ea266f8880c',
  'Doha': '1512453979798-5ea266f8880c',
  'Manama': '1512453979798-5ea266f8880c',
  'Muscat': '1512453979798-5ea266f8880c',
  'Jeddah': '1512453979798-5ea266f8880c',
  'Al Khobar': '1512453979798-5ea266f8880c',
}

// Function to get unique image for each city
const getCityImageUrlEnhanced = (city: string, country: string): string => {
  const cityKey = city.trim()
  
  // Check if we have a specific image ID for this city
  if (cityImageMap[cityKey]) {
    return `https://images.unsplash.com/photo-${cityImageMap[cityKey]}?w=1200&h=800&fit=crop&q=90`
  }
  
  // Generate consistent hash from city name to select an image
  const hash = hashString(`${city}${country}`)
  const imageIndex = hash % unsplashImageIds.length
  const imageId = unsplashImageIds[imageIndex]
  
  return `https://images.unsplash.com/photo-${imageId}?w=1200&h=800&fit=crop&q=90`
}

export default function ChooseVenueSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const isPausedRef = useRef(false)
  const autoScrollRef = useRef<{ pause: () => void; resume: () => void } | null>(null)

  // Fetch venues from API
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
              image: getCityImageUrlEnhanced(v.city || '', v.country || '')
            }))
            .filter((v: Venue) => v.city && v.country) // Only include venues with both city and country
          
          setVenues(activeVenues)
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
    router.push(`/courses?venue=${encodeURIComponent(venueFilter)}`)
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
                    <Image
                      src={venue.image}
                      alt={`${venue.city}, ${venue.country}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 280px, 300px"
                      quality={95}
                      priority={false}
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

