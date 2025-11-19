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
        animation: scrollAffiliations 40s linear infinite;
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
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className="border-blue-200 text-blue-700 bg-blue-50 px-4 py-2 text-lg ml-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              Trusted & Accredited
            </Badge>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Affiliations &{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Accreditations
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are proud to be recognized and accredited by leading professional bodies and institutions worldwide,
            ensuring the highest standards of excellence in our training programs.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Infinite Scroll Carousel */}
          <div className="relative overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            
            <div 
              ref={carouselRef}
              className="flex gap-6 affiliations-carousel"
              style={{
                width: 'fit-content',
              }}
            >
              {duplicatedAffiliations.map((affiliation, index) => (
                <Card
                  key={`${affiliation.id}-${index}`}
                  className="group flex-shrink-0 w-56 h-48 relative overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 bg-white shadow-md hover:shadow-2xl rounded-xl p-6 cursor-pointer transform hover:scale-105"
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  
                  {/* Logo Container */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Image
                      src={affiliation.image}
                      alt={affiliation.name}
                      width={140}
                      height={140}
                      className="object-contain max-h-32 max-w-full transition-transform duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg relative z-10"
                    />
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="bg-green-500 rounded-full p-1.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-md hover:shadow-lg transition-shadow rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Certified Programs</h3>
                  <p className="text-sm text-gray-600">Internationally recognized</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-md hover:shadow-lg transition-shadow rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quality Assured</h3>
                  <p className="text-sm text-gray-600">Rigorous standards</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-md hover:shadow-lg transition-shadow rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Global Recognition</h3>
                  <p className="text-sm text-gray-600">Worldwide acceptance</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

