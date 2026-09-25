"use client"

import { Building2, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { DEFAULT_CLIENT_LOGOS } from "@/lib/home-content-defaults"

type ClientLogoItem = { id: string | number; name: string; logo: string }

export default function ClientsLogoSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const autoScrollRef = useRef<{ pause: () => void; resume: () => void } | null>(null)
  const [clientLogos, setClientLogos] = useState<ClientLogoItem[]>(
    DEFAULT_CLIENT_LOGOS.map((c) => ({ id: c.id, name: c.name, logo: c.logoUrl }))
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/client-logos", { cache: "no-store" })
        const result = await res.json()
        if (cancelled || !result.success || !Array.isArray(result.data) || result.data.length === 0) return
        setClientLogos(
          result.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            logo: c.logoUrl || c.logo,
          }))
        )
      } catch (e) {
        console.error("Failed to load client logos:", e)
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
    if (!carousel || clientLogos.length === 0) return

    let animationFrameId = 0
    let scrollPosition = 0
    let loopWidth = 0
    const scrollSpeed = 0.5
    let cancelled = false

    const initAnimation = () => {
      if (cancelled) return
      const items = carousel.querySelectorAll('[data-client-item="original"]')
      if (items.length === 0) {
        setTimeout(initAnimation, 100)
        return
      }

      const firstItem = items[0] as HTMLElement
      if (!firstItem.offsetWidth) {
        setTimeout(initAnimation, 100)
        return
      }

      const gap = window.innerWidth >= 768 ? 32 : 12
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
  }, [clientLogos])

  const scrollLeft = () => {
    const carousel = carouselRef.current
    if (!carousel) return

    if (autoScrollRef.current) {
      autoScrollRef.current.pause()
    }

    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = "smooth"

    const itemWidth = window.innerWidth >= 768 ? 192 + 32 : 144 + 12
    const scrollAmount = -itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" })

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

    if (autoScrollRef.current) {
      autoScrollRef.current.pause()
    }

    const originalScrollBehavior = carousel.style.scrollBehavior
    carousel.style.scrollBehavior = "smooth"

    const itemWidth = window.innerWidth >= 768 ? 192 + 32 : 144 + 12
    const scrollAmount = itemWidth * 2
    carousel.scrollBy({ left: scrollAmount, behavior: "smooth" })

    setTimeout(() => {
      carousel.style.scrollBehavior = originalScrollBehavior
      if (autoScrollRef.current) {
        autoScrollRef.current.resume()
      }
    }, 1000)
  }

  const duplicatedLogos = [...clientLogos, ...clientLogos]

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#0A3049]/10 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            We&apos;re proud to work with leading organizations worldwide
          </p>
        </div>

        <div className="relative overflow-hidden group/container">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg border-0 h-10 w-10 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </Button>

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
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {duplicatedLogos.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                data-client-item={index < clientLogos.length ? "original" : "duplicate"}
                className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28 md:w-48 md:h-32 flex items-center justify-center bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#0A3049]/30 px-2 sm:px-3 md:px-4"
              >
                <div className="relative w-full h-full transition-all duration-300 opacity-100">
                  {String(client.logo).startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={client.logo} alt={client.name} className="w-full h-full object-contain" />
                  ) : (
                    <Image
                      src={client.logo}
                      alt={client.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 192px"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
