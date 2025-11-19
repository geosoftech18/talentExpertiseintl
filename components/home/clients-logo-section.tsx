"use client"

import { Building2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useEffect, useRef } from "react"

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

  useEffect(() => {
    // Add CSS animation for infinite scroll
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .clients-carousel {
        animation: scroll 300s linear infinite;
      }
      .clients-carousel:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...clientLogos, ...clientLogos]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className="border-blue-200 text-blue-700 bg-blue-50 px-3 py-1 text-sm ml-3"
            >
              <Users className="w-3 h-3 mr-1" />
              Trusted Partners
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Valued Clients
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're proud to work with leading organizations worldwide
          </p>
        </div>

        {/* Infinite Scroll Carousel */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={carouselRef}
            className="flex gap-8 clients-carousel"
            style={{
              width: 'fit-content',
            }}
          >
            {duplicatedLogos.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 px-4"
              >
                <div className="relative w-full h-26 transition-all duration-300 opacity-100">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 192px) 100vw, 192px"
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

