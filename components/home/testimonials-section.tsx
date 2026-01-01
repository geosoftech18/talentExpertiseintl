"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

const testimonials = [
  {
    id: 1,
    course: "Financial Statement Analysis of the Public Sector",
    rating: 5,
    review: "Excellent course 5* Great instructors who knew their subject matter well.",
    name: "Abdullah Al Thani",
    position: "Senior Financial Analyst",
    company: "Qatar Financial Authority",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Finance",
    verified: true,
    courseDate: "March 2024",
    location: "Dubai, UAE",
  },
  {
    id: 2,
    course: "Developing Professional Skills for Executive Secretaries & PA's",
    rating: 5,
    review: "The trainer was excellent, she helped everyone and provided excellent examples",
    name: "Moza Al Ali",
    position: "PA - Group Chairman",
    company: "Emirates Group",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Admin & Secretarial",
    verified: true,
    courseDate: "February 2024",
    location: "Abu Dhabi, UAE",
  },
  {
    id: 3,
    course: "Pumps & Compressors: Operation, Maintenance & Troubleshooting",
    rating: 5,
    review: "High level training delivered by High level instructors",
    name: "Mohammed Al Abdallah",
    position: "Maintenance Engineer",
    company: "Saudi Aramco",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Maintenance",
    verified: true,
    courseDate: "January 2024",
    location: "Riyadh, KSA",
  },
  {
    id: 4,
    course: "Project Management Masterclass",
    rating: 5,
    review:
      "One of the most beneficial course attended this year. Instructors capabilities to keep attention is excellent and he presented subjects clearly with great examples.",
    name: "Umar Bakoji",
    position: "Manager Services",
    company: "Nigerian National Petroleum Corporation",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Project Management",
    verified: true,
    courseDate: "April 2024",
    location: "Lagos, Nigeria",
  },
  {
    id: 5,
    course: "Putting Strategy into Action",
    rating: 5,
    review:
      "This program was excellent. Very practical, nice facilities and a great instructor who understood our business.",
    name: "Maryrose R O",
    position: "General Manager",
    company: "East African Development Bank",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Management",
    verified: true,
    courseDate: "March 2024",
    location: "Kampala, Uganda",
  },
  {
    id: 6,
    course: "Leadership for 4IR: the 4.0D Leadership Model",
    rating: 5,
    review:
      "I have attended more than 30 training programs in my career and this was by far the best Leadership training event EVER! Johann and John are a compelling double act.",
    name: "Dr. James D. Wilson. BDS",
    position: "Chief Executive Officer",
    company: "Wilson Dental Group",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Leadership",
    verified: true,
    courseDate: "February 2024",
    location: "London, UK",
  },
  {
    id: 7,
    course: "Due Diligence in the Petroleum Business",
    rating: 5,
    review:
      "The instructor made the complexities of corporate governance seem easy. Thoroughly recommend this program.",
    name: "Yakubu A",
    position: "General Manager",
    company: "Nigerian Petroleum Development Company",
    avatar: "/placeholder.svg?height=60&width=60",
    category: "Oil & Gas",
    verified: true,
    courseDate: "January 2024",
    location: "Abuja, Nigeria",
  },
]

const stats = [
  { label: "Happy Clients", value: "15,000+", icon: Users },
  { label: "5-Star Reviews", value: "98%", icon: Star },
  { label: "Course Completion", value: "96%", icon: Award },
  { label: "Satisfaction Rate", value: "99.2%", icon: TrendingUp },
]

const categories = [
  "All Categories",
  "Finance",
  "Leadership",
  "Project Management",
  "Oil & Gas",
  "Management",
  "Admin & Secretarial",
  "Maintenance",
]

export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel")
  const [testimonialsPerSlide, setTestimonialsPerSlide] = useState(1)
  const [isDesktop, setIsDesktop] = useState(false)

  const filteredTestimonials = testimonials.filter(
    (testimonial) => selectedCategory === "All Categories" || testimonial.category === selectedCategory,
  )

  // Calculate testimonials per slide based on screen size
  useEffect(() => {
    const updateTestimonialsPerSlide = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setTestimonialsPerSlide(1) // Mobile: 1 testimonial
          setIsDesktop(false)
        } else if (window.innerWidth < 1024) {
          setTestimonialsPerSlide(2) // Tablet: 2 testimonials
          setIsDesktop(false)
        } else {
          setTestimonialsPerSlide(3) // Desktop: 3 testimonials
          setIsDesktop(true)
        }
      }
    }

    updateTestimonialsPerSlide()
    window.addEventListener('resize', updateTestimonialsPerSlide)
    return () => window.removeEventListener('resize', updateTestimonialsPerSlide)
  }, [])

  // For desktop: slides overlap (each slide moves by 1 card, shows 3 cards)
  // For mobile/tablet: slides don't overlap (each slide shows all cards, moves by full slide)
  const totalSlides = isDesktop 
    ? Math.max(1, filteredTestimonials.length - 2) // Desktop: overlapping slides
    : Math.ceil(filteredTestimonials.length / testimonialsPerSlide) // Mobile/Tablet: non-overlapping slides

  useEffect(() => {
    if (!isAutoPlaying || viewMode === "grid") return

    const interval = setInterval(() => {
      if (isDesktop) {
        const maxSlide = Math.max(0, filteredTestimonials.length - 3)
        setCurrentSlide((prev) => {
          if (prev >= maxSlide) return 0
          return prev + 1
        })
      } else {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSlides, viewMode, isDesktop, filteredTestimonials.length])

  const nextSlide = () => {
    if (isDesktop) {
      // Desktop: move by 1, but don't go beyond the last valid position (showing 3 cards)
      const maxSlide = Math.max(0, filteredTestimonials.length - 3)
      setCurrentSlide((prev) => Math.min(prev + 1, maxSlide))
    } else {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    if (isDesktop) {
      setCurrentSlide((prev) => Math.max(prev - 1, 0))
    } else {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    }
    setIsAutoPlaying(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const TestimonialCard = ({ testimonial, featured = false }: { testimonial: any; featured?: boolean }) => (
    <Card
      className={`group hover:shadow-2xl transition-all duration-500 border-2 overflow-hidden h-full ${
        featured
          ? "border-[#6F4E25]/30 bg-gradient-to-br from-white to-[#6F4E25]/10 shadow-xl scale-105"
          : "border-gray-200 hover:border-purple-200 hover:-translate-y-2"
      }`}
    >
      <CardContent className="p-4 sm:p-5 lg:p-6 relative">
        {/* Quote Icon */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-10">
          <Quote className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#6F4E25]" />
        </div>

        {/* Course Badge */}
        <div className="mb-3 sm:mb-4">
          <Badge variant="outline" className="bg-[#6F4E25]/10 text-[#6F4E25] border-[#6F4E25]/30 text-[10px] sm:text-xs font-medium mb-2">
            {testimonial.category}
          </Badge>
          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">{testimonial.course}</h4>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="flex space-x-0.5 sm:space-x-1 mr-1.5 sm:mr-2">
            {renderStars(testimonial.rating)}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-600">({testimonial.rating}.0)</span>
        </div>

        {/* Review */}
        <blockquote className="text-gray-700 mb-4 sm:mb-6 leading-relaxed line-clamp-4 relative z-10 text-xs sm:text-sm">
          "{testimonial.review}"
        </blockquote>

        {/* Reviewer Info */}
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-purple-200 flex-shrink-0">
            <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
            <AvatarFallback className="bg-[#6F4E25]/10 text-[#6F4E25] font-semibold text-xs sm:text-sm">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-0.5 sm:mb-1">
              <h5 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{testimonial.name}</h5>
              {testimonial.verified && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1 truncate">{testimonial.position}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 line-clamp-1">{testimonial.company}</p>
            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-gray-400 flex-wrap">
              <span>{testimonial.courseDate}</span>
              <span>•</span>
              <span className="truncate">{testimonial.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-[#6F4E25]/5 via-white to-[#0A3049]/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#6F4E25]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#0A3049]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A3049] mr-2 sm:mr-3" />
            <Badge variant="outline" className="border-[#0A3049]/30 text-[#0A3049] bg-[#0A3049]/10 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
              Client Testimonials
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A3049] mb-4 sm:mb-6 px-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-[#0A3049] to-[#6F4E25] bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
            Discover why thousands of professionals trust us for their career development. Real stories from real people
            who transformed their careers with our training programs.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="text-center p-3 sm:p-4 lg:p-6 border-2 border-[#6F4E25]/20 bg-gradient-to-br from-white to-[#6F4E25]/5 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-[#6F4E25]/10 rounded-full">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#6F4E25]" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6">
          {/* Category Filter */}
          <div className="w-full lg:w-auto relative">
            <div className="flex lg:flex-wrap gap-2 justify-start lg:justify-start overflow-x-auto lg:overflow-visible pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory lg:snap-none px-1 lg:px-0 -mx-1 lg:mx-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category)
                    setCurrentSlide(0)
                  }}
                  className={`transition-all duration-200 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 snap-start ${
                    selectedCategory === category
                      ? "bg-[#0A3049] text-white shadow-lg"
                      : "border-[#6F4E25]/30 !text-[#6F4E25] hover:bg-[#6F4E25]/10"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          {/* <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "carousel" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("carousel")}
                className="px-4"
              >
                Carousel
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-4"
              >
                Grid
              </Button>
            </div>

            {viewMode === "carousel" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="border-[#6F4E25]/30 text-[#6F4E25] hover:bg-[#6F4E25]/10"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </div> */}
        </div>

        {/* Testimonials Display */}
        {viewMode === "carousel" ? (
          <div className="relative">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl">
              {isDesktop ? (
                // Desktop: Show all cards in a row, move by 1 card width (accounting for gap)
                <div className="px-2 sm:px-4 overflow-hidden">
                  <div
                    className="flex gap-4 sm:gap-5 lg:gap-6 transition-transform duration-700 ease-in-out"
                    style={{ 
                      transform: `translateX(calc(-${currentSlide} * (100% / 3 + 0.5rem)))`
                    }}
                  >
                    {filteredTestimonials.map((testimonial, index) => (
                      <div key={testimonial.id} className="w-[calc(33.333%-0.75rem)] sm:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-1rem)] flex-shrink-0">
                        <TestimonialCard
                          testimonial={testimonial}
                          featured={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Mobile/Tablet: Traditional slide-based carousel
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }, (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className={`grid gap-4 sm:gap-5 lg:gap-6 px-2 sm:px-4 ${
                        testimonialsPerSlide === 1 ? 'grid-cols-1' : 
                        testimonialsPerSlide === 2 ? 'grid-cols-1 sm:grid-cols-2' : 
                        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {filteredTestimonials
                          .slice(slideIndex * testimonialsPerSlide, (slideIndex + 1) * testimonialsPerSlide)
                          .map((testimonial, index) => (
                            <TestimonialCard
                              key={testimonial.id}
                              testimonial={testimonial}
                              featured={index === 1 && testimonialsPerSlide === 3}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-1 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group z-10"
              disabled={totalSlides <= 1}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-1 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group z-10"
              disabled={totalSlides <= 1}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>

            {/* Slide Indicators */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 space-x-1.5 sm:space-x-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index)
                      setIsAutoPlaying(false)
                    }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-[#0A3049] scale-125" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16 px-4">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Join Our Success Stories?</h3>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Transform your career with our world-class training programs and become our next success story.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#0A3049] hover:bg-[#0A3049]/90 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              Browse Our Courses
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#6F4E25]/30 text-[#6F4E25] hover:bg-[#6F4E25]/10 font-semibold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl w-full sm:w-auto"
            >
              Read More Reviews
              <Star className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
