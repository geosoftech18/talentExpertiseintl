"use client"

import { Building2, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

// Sample client logos - replace with actual client logos
const clientLogos = [
  { id: 1, name: "Client 1", logo: "/clients/1.jpg" },
  { id: 2, name: "Client 2", logo: "/clients/2.jpg" },
  { id: 3, name: "Client 3", logo: "/clients/3.jpg" },
  { id: 4, name: "Client 4", logo: "/clients/4.jpg" },
  { id: 5, name: "Client 5", logo: "/clients/5.jpg" },
  { id: 6, name: "Client 6", logo: "/clients/6.jpg" },
  { id: 7, name: "Client 7", logo: "/clients/7.jpg" },
  { id: 8, name: "Client 8", logo: "/clients/8.jpg" },
  { id: 9, name: "Client 9", logo: "/clients/9.jpg" },
  { id: 10, name: "Client 10", logo: "/clients/10.jpg" },
  { id: 11, name: "Client 11", logo: "/clients/11.jpg" },
  { id: 12, name: "Client 12", logo: "/clients/12.jpg" },
  { id: 13, name: "Client 13", logo: "/clients/13.jpg" },
  { id: 14, name: "Client 14", logo: "/clients/14.jpg" },
  { id: 15, name: "Client 15", logo: "/clients/15.jpg" },
  { id: 16, name: "Client 16", logo: "/clients/16.jpg" },
  { id: 17, name: "Client 17", logo: "/clients/17.jpg" },
  { id: 18, name: "Client 18", logo: "/clients/18.jpg" },
  { id: 19, name: "Client 19", logo: "/clients/19.jpg" },
  { id: 20, name: "Client 20", logo: "/clients/20.jpg" },
  { id: 21, name: "Client 21", logo: "/clients/21.jpg" },
  { id: 22, name: "Client 22", logo: "/clients/22.jpg" },
  { id: 23, name: "Client 23", logo: "/clients/23.jpg" },
  { id: 24, name: "Client 24", logo: "/clients/24.jpg" },
  { id: 25, name: "Client 25", logo: "/clients/25.jpg" },
  { id: 26, name: "Client 26", logo: "/clients/26.jpg" },
  { id: 27, name: "Client 27", logo: "/clients/27.jpg" },
  { id: 28, name: "Client 28", logo: "/clients/28.jpg" },
  { id: 29, name: "Client 29", logo: "/clients/29.jpg" },
  { id: 30, name: "Client 30", logo: "/clients/30.jpg" },
  { id: 31, name: "Client 31", logo: "/clients/31.jpg" },
  { id: 32, name: "Client 32", logo: "/clients/32.jpg" },
  { id: 33, name: "Client 33", logo: "/clients/33.jpg" },
  { id: 34, name: "Client 34", logo: "/clients/34.jpg" },
  { id: 35, name: "Client 35", logo: "/clients/35.jpg" },
  { id: 36, name: "Client 36", logo: "/clients/36.jpg" },
]

export default function ClientsLogoSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const autoScrollRef = useRef<{ pause: () => void; resume: () => void } | null>(null)

  // Auto-scroll animation
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationFrameId: number
    let scrollPosition = 0
    let originalWidth = 0
    let itemWidth = 0
    const scrollSpeed = 0.5 // pixels per frame for smooth animation

    const initAnimation = () => {
      // Wait for DOM to be ready
      const items = carousel.querySelectorAll('[data-client-item]:not([data-client-item="clone"])')
      if (items.length === 0) {
        setTimeout(initAnimation, 100)
        return
      }

      // Get actual item width including gap
      const firstItem = items[0] as HTMLElement
      if (!firstItem.offsetWidth || firstItem.offsetWidth === 0) {
        setTimeout(initAnimation, 100)
        return
      }

      itemWidth = firstItem.offsetWidth + (window.innerWidth >= 768 ? 32 : 12) // gap-8 on desktop, gap-3 on mobile

      // Clear any existing clones
      const existingClones = carousel.querySelectorAll('[data-client-item="clone"]')
      existingClones.forEach(clone => clone.remove())

      // Duplicate items for seamless loop
      const itemsArray = Array.from(items)
      itemsArray.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement
        clone.setAttribute('data-client-item', 'clone')
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

      // Store pause/resume functions
      autoScrollRef.current = {
        pause: () => {
          isPausedRef.current = true
          scrollPosition = carousel.scrollLeft
        },
        resume: () => {
          isPausedRef.current = false
          scrollPosition = carousel.scrollLeft
        }
      }

      // Start animation
      animationFrameId = requestAnimationFrame(animate)
    }

    // Initialize after a short delay
    const timeoutId = setTimeout(initAnimation, 300)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Navigation handlers
  const scrollLeft = () => {
    const carousel = carouselRef.current
    if (!carousel) return
    
    // Pause auto-scroll
    if (autoScrollRef.current) {
      autoScrollRef.current.pause()
    }
    
    // Temporarily enable smooth scrolling for manual navigation
    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = 'smooth'
    
    // Calculate scroll amount (approximately 2-3 items)
    const itemWidth = window.innerWidth >= 768 ? 192 + 32 : 144 + 12 // card width + gap
    const scrollAmount = -itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    
    // Restore auto scroll behavior and resume after scroll completes
    setTimeout(() => {
      carousel.style.scrollBehavior = originalScrollBehavior
      if (autoScrollRef.current) {
        autoScrollRef.current.resume()
      }
    }, 1000)
  }

  const scrollRight = () => {
    const carousel = carouselRef.current
    if (!carousel) return
    
    // Pause auto-scroll
    if (autoScrollRef.current) {
      autoScrollRef.current.pause()
    }
    
    // Temporarily enable smooth scrolling for manual navigation
    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = 'smooth'
    
    // Calculate scroll amount (approximately 2-3 items)
    const itemWidth = window.innerWidth >= 768 ? 192 + 32 : 144 + 12 // card width + gap
    const scrollAmount = itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    
    // Restore auto scroll behavior and resume after scroll completes
    setTimeout(() => {
      carousel.style.scrollBehavior = originalScrollBehavior
      if (autoScrollRef.current) {
        autoScrollRef.current.resume()
      }
    }, 1000)
  }

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...clientLogos, ...clientLogos]

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#0A3049]/10 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className="border-[#6F4E25]/30 text-[#6F4E25] bg-[#6F4E25]/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm ml-2 sm:ml-3"
            >
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              Trusted Partners
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#0A3049] mb-2 sm:mb-3 px-4">
            Our{" "}
            <span className="bg-gradient-to-r from-[#0A3049] to-[#6F4E25] bg-clip-text text-transparent">
              Valued Clients
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            We're proud to work with leading organizations worldwide
          </p>
        </div>

        {/* Infinite Scroll Carousel */}
        <div className="relative overflow-hidden group/container">
          {/* Left Navigation Arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Right Navigation Arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={carouselRef}
            className="flex gap-3 sm:gap-4 md:gap-8 overflow-x-hidden"
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
            {duplicatedLogos.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                data-client-item={index < clientLogos.length ? '' : 'clone'}
                className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28 md:w-48 md:h-32 flex items-center justify-center bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#0A3049]/30 px-2 sm:px-3 md:px-4"
              >
                <div className="relative w-full h-full transition-all duration-300 opacity-100">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 192px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

