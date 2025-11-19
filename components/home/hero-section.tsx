"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Users, Video, Building, MessageCircle, Star, Globe, Award } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Face-to-Face Public Training",
    subtitle: "Exceptional Learning Experience",
    description:
      "Our unrivalled faculty of trainers, consultants and specialist facilitators bring learning to life in a very real way with hands-on, interactive sessions.",
    icon: Users,
    features: ["Expert Facilitators", "Interactive Sessions", "Networking Opportunities", "Premium Venues"],
    gradient: "from-purple-600 via-purple-700 to-indigo-800",
  },
  {
    id: 2,
    title: "Virtual Live Training",
    subtitle: "Learn From Anywhere",
    description:
      "For those who can't attend training in person, we deliver more than 85% of our advertised face-to-face programs in a cutting-edge virtual environment.",
    icon: Video,
    features: ["85+ Programs Available", "Real-time Interaction", "Global Accessibility", "Same Quality Experience"],
    gradient: "from-blue-600 via-cyan-600 to-teal-700",
  },
  {
    id: 3,
    title: "Inhouse Training",
    subtitle: "Tailored Solutions",
    description:
      "All of our advertised programs can be further tailored to meet your specific organizational needs and delivered as customized inhouse programs.",
    icon: Building,
    features: ["Customized Content", "On-site Delivery", "Team Building", "Cost Effective"],
    gradient: "from-emerald-600 via-green-600 to-teal-700",
  },
  {
    id: 4,
    title: "Consulting, Mentoring & Coaching",
    subtitle: "Human-Centered Approach",
    description:
      "Our key strength is our unwavering approach to putting humanity back into the learning arena with personalized guidance and support.",
    icon: MessageCircle,
    features: ["Personal Mentoring", "Strategic Consulting", "Leadership Coaching", "Ongoing Support"],
    gradient: "from-orange-600 via-red-600 to-pink-700",
  },
]

export default function Component() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const currentSlideData = slides[currentSlide]
  const IconComponent = currentSlideData.icon

  return (
    <div className="relative min-h-screen  overflow-hidden">
      {/* Background with animated gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} transition-all duration-1000 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10" />
      </div>

      {/* Header with company badge */}
      <div className="absolute top-6 right-6 z-20">
        <Badge variant="secondary" className="bg-white/90 text-gray-800 px-4 py-2 text-sm font-semibold">
          <Award className="w-4 h-4 mr-2" />
          Since 1983
        </Badge>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center min-h-screen ">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm">
                    {currentSlideData.subtitle}
                  </Badge>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-white/90 text-2xl font-medium mb-2">Welcome to</span>
                  <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Talent Expertise
                  </span>
                  <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    International
                  </span>
                </h1>

                <h2 className="text-3xl lg:text-4xl font-semibold text-white/95 mt-6">{currentSlideData.title}</h2>

                <p className="text-xl text-white/90 leading-relaxed max-w-2xl">{currentSlideData.description}</p>
              </div>



                        {/* Features and CTA - Desktop: one line, Mobile: stacked */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 overflow-hidden">
              

                  {/* CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:shrink-0 lg:gap-3 mt-4 lg:mt-0">
                    <Button className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-5 lg:px-5 py-2.5 text-sm lg:text-sm whitespace-nowrap">
                      Submit Enquiry
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/30 text-gray-900 hover:bg-white/10 backdrop-blur-sm font-semibold px-5 lg:px-5 py-2.5 text-sm lg:text-sm whitespace-nowrap"
                    >
                      Learn More
                    </Button>
                  </div>
              
                  {/* Features - Grid on mobile, Flex row on desktop */}
                  <div className="grid grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-1 lg:flex-nowrap lg:flex-1 lg:mr-4 lg:overflow-hidden">
                    {currentSlideData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1.5 text-white/90 whitespace-nowrap shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current shrink-0" />
                        <span className="text-xs lg:text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-sm text-white/70">Expert Consultants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">36+</div>
                  <div className="text-sm text-white/70">Global Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">40+</div>
                  <div className="text-sm text-white/70">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Right content - Service preview */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-semibold text-white">Global Excellence</h3>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    Our reputation as an 'exceptional provider' of world-class training, coaching and consulting
                    services continues to grow each year through our seamless, end-to-end experience.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">85%</div>
                      <div className="text-xs text-white/70">Virtual Programs</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-white">1000s</div>
                      <div className="text-xs text-white/70">Professionals Trained</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
              }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
