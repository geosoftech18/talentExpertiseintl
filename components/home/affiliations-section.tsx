"use client"

import { Award, Shield, CheckCircle2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useEffect, useRef } from "react"

const affiliations = [
  { id: 1, name: "Accreditation Partner 1", image: "/Affiliations/1.png" },
  { id: 2, name: "Accreditation Partner 2", image: "/Affiliations/2.png" },
  { id: 3, name: "Accreditation Partner 3", image: "/Affiliations/3.png" },
  { id: 4, name: "Accreditation Partner 4", image: "/Affiliations/4.png" },
  { id: 5, name: "Accreditation Partner 5", image: "/Affiliations/5.png" },
  { id: 6, name: "Accreditation Partner 6", image: "/Affiliations/1.jpg" },
  { id: 7, name: "Accreditation Partner 7", image: "/Affiliations/2.jpg" },
  { id: 8, name: "Accreditation Partner 8", image: "/Affiliations/3.jpg" },
  { id: 9, name: "Accreditation Partner 9", image: "/Affiliations/4.jpg" },
  { id: 10, name: "Accreditation Partner 10", image: "/Affiliations/5.jpg" },
  { id: 11, name: "Accreditation Partner 11", image: "/Affiliations/6.jpg" },
  { id: 12, name: "Accreditation Partner 12", image: "/Affiliations/7.jpg" },
  { id: 13, name: "Accreditation Partner 13", image: "/Affiliations/8.jpg" },
  { id: 14, name: "Accreditation Partner 14", image: "/Affiliations/9.jpg" },
  { id: 15, name: "Accreditation Partner 15", image: "/Affiliations/10.jpg" },
  { id: 16, name: "Accreditation Partner 16", image: "/Affiliations/11.jpg" },
  { id: 17, name: "Accreditation Partner 17", image: "/Affiliations/12.jpg" },
  { id: 18, name: "Accreditation Partner 18", image: "/Affiliations/13.jpg" },
]

export default function AffiliationsSection() {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add CSS animation for infinite scroll
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scrollAffiliations {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .affiliations-carousel {
        animation: scrollAffiliations 200s linear infinite;
      }
      .affiliations-carousel:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

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
          <div className="relative overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 hidden md:block top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            
            <div 
              ref={carouselRef}
              className="flex gap-3 sm:gap-4 md:gap-6 affiliations-carousel"
              style={{
                width: 'fit-content',
              }}
            >
              {duplicatedAffiliations.map((affiliation, index) => (
                <Card
                  key={`${affiliation.id}-${index}`}
                  className="group flex-shrink-0 w-36 h-32 sm:w-40 sm:h-36 md:w-48 md:h-40 lg:w-56 lg:h-48 relative overflow-hidden border-2 border-gray-200 hover:border-[#0A3049]/40 transition-all duration-300 bg-white shadow-md hover:shadow-2xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer transform hover:scale-105"
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
                  
                  {/* Logo Container */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Image
                      src={affiliation.image}
                      alt={affiliation.name}
                      width={140}
                      height={140}
                      className="object-contain max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-32 max-w-full transition-transform duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg relative z-10"
                      sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                    />
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

