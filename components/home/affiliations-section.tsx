"use client"

import { Award, Shield, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { DEFAULT_AFFILIATIONS } from "@/lib/home-content-defaults"

type AffiliationItem = { id: string | number; name: string; image: string; url: string }

export default function AffiliationsSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const autoScrollRef = useRef<{ pause: () => void; resume: () => void } | null>(null)
  const router = useRouter()
  const [affiliations, setAffiliations] = useState<AffiliationItem[]>(
    DEFAULT_AFFILIATIONS.map((a) => ({
      id: a.id,
      name: a.name,
      image: a.imageUrl,
      url: a.url || "#",
    }))
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/affiliations", { cache: "no-store" })
        const result = await res.json()
        if (cancelled || !result.success || !Array.isArray(result.data) || result.data.length === 0) return
        setAffiliations(
          result.data.map((a: any) => ({
            id: a.id,
            name: a.name,
            image: a.imageUrl || a.image,
            url: a.url || "#",
          }))
        )
      } catch (e) {
        console.error("Failed to load affiliations:", e)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-scroll using React-duplicated items only (no cloneNode — that breaks React removeChild)
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || affiliations.length === 0) return

    let animationFrameId = 0
    let scrollPosition = 0
    let loopWidth = 0
    const scrollSpeed = 0.5
    let cancelled = false

    const initAnimation = () => {
      if (cancelled) return
      const items = carousel.querySelectorAll('[data-affiliation-item="original"]')
      if (items.length === 0) {
        setTimeout(initAnimation, 100)
        return
      }

      const firstItem = items[0] as HTMLElement
      if (!firstItem.offsetWidth) {
        setTimeout(initAnimation, 100)
        return
      }

      const gap = window.innerWidth >= 768 ? 24 : 12
      loopWidth = items.length * (firstItem.offsetWidth + gap)

      carousel.style.scrollBehavior = "auto"
      carousel.scrollLeft = 0
      scrollPosition = 0

      const animate = () => {
        if (cancelled) return
        if (!isPausedRef.current && loopWidth > 0) {
          scrollPosition += scrollSpeed
          if (scrollPosition >= loopWidth) {
            scrollPosition -= loopWidth
          }
          carousel.scrollLeft = scrollPosition
        }
        animationFrameId = requestAnimationFrame(animate)
      }

      autoScrollRef.current = {
        pause: () => {
          isPausedRef.current = true
          scrollPosition = carousel.scrollLeft
        },
        resume: () => {
          isPausedRef.current = false
          scrollPosition = carousel.scrollLeft
        },
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    const timeoutId = setTimeout(initAnimation, 300)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [affiliations])

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
    const itemWidth = window.innerWidth >= 768 ? 192 + 24 : 144 + 12 // card width + gap
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
    const itemWidth = window.innerWidth >= 768 ? 192 + 24 : 144 + 12 // card width + gap
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

  // Duplicate affiliations for seamless infinite scroll
  const duplicatedAffiliations = [...affiliations, ...affiliations]

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#0A3049]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className="border-[#6F4E25]/30 text-[#6F4E25] bg-[#6F4E25]/10 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm md:text-base lg:text-lg ml-2 sm:ml-3 md:ml-4"
            >
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2" />
              Trusted & Accredited
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#0A3049] mb-2 sm:mb-3 md:mb-4 px-4">
            Affiliations &{" "}
            <span className="bg-gradient-to-r from-[#0A3049] to-[#6F4E25] bg-clip-text text-transparent">
              Accreditations
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            We are proud to be recognized and accredited by leading professional bodies and institutions worldwide,
            ensuring the highest standards of excellence in our training programs.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
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
            <div className="absolute left-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            
            <div 
              ref={carouselRef}
              className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-hidden"
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
              {duplicatedAffiliations.map((affiliation, index) => (
                <Card
                  key={`${affiliation.id}-${index}`}
                  data-affiliation-item={index < affiliations.length ? "original" : "duplicate"}
                  className="group flex-shrink-0 w-36 h-32 sm:w-40 sm:h-36 md:w-48 md:h-40 lg:w-56 lg:h-48 relative overflow-hidden border-2 border-gray-200 hover:border-[#0A3049]/40 transition-all duration-300 bg-white shadow-md hover:shadow-2xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer transform hover:scale-105"
                  onClick={() => {
                    if (!affiliation.url || affiliation.url === "#") return
                    if (affiliation.url.startsWith("http")) {
                      window.open(affiliation.url, "_blank", "noopener,noreferrer")
                    } else {
                      router.push(affiliation.url)
                    }
                  }}
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
                  
                  {/* Logo Container */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {String(affiliation.image).startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={affiliation.image}
                        alt={affiliation.name}
                        className="object-contain max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-32 max-w-full transition-transform duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg relative z-10"
                      />
                    ) : (
                      <Image
                        src={affiliation.image}
                        alt={affiliation.name}
                        width={140}
                        height={140}
                        className="object-contain max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-32 max-w-full transition-transform duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg relative z-10"
                        sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                      />
                    )}
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="bg-green-500 rounded-full p-1 sm:p-1.5 shadow-lg">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-[#0A3049]/20 shadow-md hover:shadow-lg transition-shadow rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-2.5 md:p-3 bg-[#0A3049]/10 rounded-full">
                  <Shield className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#0A3049]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A3049] text-sm sm:text-base">Certified Programs</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Internationally recognized</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-md hover:shadow-lg transition-shadow rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-2.5 md:p-3 bg-indigo-100 rounded-full">
                  <Award className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A3049] text-sm sm:text-base">Quality Assured</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Rigorous standards</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-md hover:shadow-lg transition-shadow rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-2.5 md:p-3 bg-purple-100 rounded-full">
                  <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A3049] text-sm sm:text-base">Global Recognition</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Worldwide acceptance</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

