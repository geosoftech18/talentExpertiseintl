"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
  Globe,
  Zap,
  Target,
  Briefcase,
  Settings,
  DollarSign,
  MessageSquare,
  Building,
  Shield,
  Code,
  Wrench,
  BarChart3,
  HeadphonesIcon,
  Lightbulb,
  ArrowRight,
  Clock,
  MapPin,
  X,
} from "lucide-react"

const courseCategories = [
  {
    id: "mechanical",
    title: "Mechanical Engineering",
    description: "Advanced mechanical systems, design principles, and industrial applications",
    icon: Settings,
    courseCount: 45,
    color: "from-blue-600 to-blue-800",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    borderColor: "border-blue-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: true,
    featured: false,
  },
  {
    id: "management",
    title: "Management & Leadership",
    description: "Executive leadership, team management, and strategic decision making",
    icon: Users,
    courseCount: 62,
    color: "from-purple-600 to-purple-800",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900",
    borderColor: "border-purple-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: true,
  },
  {
    id: "maintenance",
    title: "Maintenance Management",
    description: "Preventive maintenance, asset management, and operational efficiency",
    icon: Wrench,
    courseCount: 28,
    color: "from-orange-600 to-orange-800",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900",
    borderColor: "border-orange-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "oil-gas",
    title: "Oil & Gas",
    description: "Petroleum engineering, refinery operations, and energy sector expertise",
    icon: Zap,
    courseCount: 34,
    color: "from-green-600 to-green-800",
    bgColor: "bg-green-50",
    textColor: "text-green-900",
    borderColor: "border-green-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: true,
    featured: false,
  },
  {
    id: "project",
    title: "Project Management",
    description: "PMP certification, agile methodologies, and project delivery excellence",
    icon: Target,
    courseCount: 51,
    color: "from-indigo-600 to-indigo-800",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-900",
    borderColor: "border-indigo-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: true,
  },
  {
    id: "purchasing",
    title: "Purchasing Management",
    description: "Supply chain optimization, vendor management, and procurement strategies",
    icon: DollarSign,
    courseCount: 23,
    color: "from-teal-600 to-teal-800",
    bgColor: "bg-teal-50",
    textColor: "text-teal-900",
    borderColor: "border-teal-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "public-relations",
    title: "Public Relations",
    description: "Brand communication, media relations, and corporate reputation management",
    icon: MessageSquare,
    courseCount: 19,
    color: "from-pink-600 to-pink-800",
    bgColor: "bg-pink-50",
    textColor: "text-pink-900",
    borderColor: "border-pink-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "urban-planning",
    title: "Urban Planning & Development",
    description: "City planning, sustainable development, and infrastructure management",
    icon: Building,
    courseCount: 16,
    color: "from-cyan-600 to-cyan-800",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-900",
    borderColor: "border-cyan-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "admin",
    title: "Admin & Secretarial",
    description: "Executive assistance, office management, and administrative excellence",
    icon: Briefcase,
    courseCount: 31,
    color: "from-gray-600 to-gray-800",
    bgColor: "bg-gray-50",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "contracts",
    title: "Contracts Management",
    description: "Legal frameworks, contract negotiation, and compliance management",
    icon: Award,
    courseCount: 27,
    color: "from-violet-600 to-violet-800",
    bgColor: "bg-violet-50",
    textColor: "text-violet-900",
    borderColor: "border-violet-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "customer-service",
    title: "Customer Service",
    description: "Customer experience, service excellence, and relationship management",
    icon: HeadphonesIcon,
    courseCount: 25,
    color: "from-rose-600 to-rose-800",
    bgColor: "bg-rose-50",
    textColor: "text-rose-900",
    borderColor: "border-rose-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: true,
    featured: false,
  },
  {
    id: "electrical",
    title: "Electrical Engineering",
    description: "Power systems, electronics, and electrical safety standards",
    icon: Lightbulb,
    courseCount: 38,
    color: "from-yellow-600 to-yellow-800",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-900",
    borderColor: "border-yellow-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "finance",
    title: "Finance & Accounting",
    description: "Financial analysis, accounting principles, and investment strategies",
    icon: BarChart3,
    courseCount: 44,
    color: "from-emerald-600 to-emerald-800",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: true,
  },
  {
    id: "hr",
    title: "HR Management",
    description: "Human resources, talent acquisition, and organizational development",
    icon: Users,
    courseCount: 36,
    color: "from-red-600 to-red-800",
    bgColor: "bg-red-50",
    textColor: "text-red-900",
    borderColor: "border-red-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "quality",
    title: "Quality, Health & Safety",
    description: "ISO standards, workplace safety, and quality management systems",
    icon: Shield,
    courseCount: 29,
    color: "from-lime-600 to-lime-800",
    bgColor: "bg-lime-50",
    textColor: "text-lime-900",
    borderColor: "border-lime-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: false,
    featured: false,
  },
  {
    id: "it",
    title: "Information Technology",
    description: "Software development, cybersecurity, and digital transformation",
    icon: Code,
    courseCount: 67,
    color: "from-blue-600 to-purple-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    borderColor: "border-blue-200",
    image: "/placeholder.svg?height=200&width=300",
    trending: true,
    featured: true,
  },
]

const specialOffers = [
  {
    id: "dubai-special",
    title: "Dubai Special Offers",
    subtitle: "Exclusive Discounts for MENA Region",
    description: "Up to 30% off on selected courses for our Middle East clients",
    gradient: "from-purple-600 via-pink-600 to-red-600",
    badge: "Limited Time",
    cta: "View Offers",
  },
  {
    id: "classroom-learning",
    title: "Face-to-Face Excellence",
    subtitle: "Premium Classroom Experience",
    description: "300+ certified courses with expert instructors in world-class venues",
    gradient: "from-orange-600 via-red-600 to-pink-600",
    badge: "Most Popular",
    cta: "Explore Courses",
  },
  {
    id: "london-calling",
    title: "London Training Hub",
    subtitle: "UK's Premier Training Destination",
    description: "Attend top-rated courses in the heart of London's business district",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    badge: "Premium Venue",
    cta: "View Courses",
  },
  {
    id: "virtual-learning",
    title: "Virtual Live Training",
    subtitle: "Real-Time Interactive Learning",
    description: "Experience face-to-face quality training from anywhere in the world",
    gradient: "from-green-600 via-teal-600 to-blue-600",
    badge: "Most Flexible",
    cta: "Join Online",
  },
  {
    id: "inhouse-training",
    title: "Custom Enterprise Solutions",
    subtitle: "Tailored for Your Organization",
    description: "Bespoke training programs designed specifically for your team's needs",
    gradient: "from-teal-600 via-cyan-600 to-blue-600",
    badge: "Enterprise",
    cta: "Get Quote",
  },
]

export default function CourseCategoriesSection() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [cardsPerView, setCardsPerView] = useState(4)
  const sliderRef = useRef<HTMLDivElement>(null)
  const selectedCategoryRef = useRef<HTMLDivElement>(null)

  const filteredCategories = courseCategories.filter((category) =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const featuredCategories = courseCategories.filter((cat) => cat.featured)
  const trendingCategories = courseCategories.filter((cat) => cat.trending)

  // Calculate cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setCardsPerView(1) // Mobile: 1 card
        } else if (window.innerWidth < 1024) {
          setCardsPerView(2) // Tablet: 2 cards
        } else {
          setCardsPerView(4) // Desktop: 4 cards
        }
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlide = Math.max(0, specialOffers.length - cardsPerView)
        return prev >= maxSlide ? 0 : prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, cardsPerView])

  const nextSlide = () => {
    const maxSlide = Math.max(0, specialOffers.length - cardsPerView)
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1))
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    const maxSlide = Math.max(0, specialOffers.length - cardsPerView)
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1))
    setIsAutoPlaying(false)
  }

  const scrollToCategory = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 320
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    const isCurrentlySelected = selectedCategory === categoryId
    setSelectedCategory(isCurrentlySelected ? null : categoryId)
  }

  // Scroll to category details when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      // Wait for React to render the component, then scroll
      let retryCount = 0
      const maxRetries = 10
      
      const scrollToCategory = () => {
        if (selectedCategoryRef.current) {
          const offset = 120 // Offset from top of viewport
          const elementPosition = selectedCategoryRef.current.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
            behavior: 'smooth'
          })
        } else if (retryCount < maxRetries) {
          // If ref is not ready, try again after a short delay
          retryCount++
          setTimeout(scrollToCategory, 50)
        }
      }

      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(scrollToCategory, 200) // Delay to ensure React has rendered the component
      })
    }
  }, [selectedCategory])

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mr-2 sm:mr-3" />
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
              Course Categories
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Training Universe
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            Discover world-class professional development across 16+ specialized categories, delivered by industry
            experts in premium venues worldwide.
          </p>

          {/* Unified Search and Stats */}
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative mb-6 sm:mb-8">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search course categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-600" />
                <span className="font-medium">
                  {courseCategories.reduce((total, cat) => total + cat.courseCount, 0)} Total Courses
                </span>
              </div>
              <div className="flex items-center">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                <span className="font-medium">16 Categories</span>
              </div>
              <div className="flex items-center">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500" />
                <span className="font-medium">{featuredCategories.length} Featured</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                <span className="font-medium">{trendingCategories.length} Trending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-10 sm:space-y-12 lg:space-y-16">
          {/* Special Offers - Responsive Cards Per Slide */}
          <div className="relative px-2 sm:px-4">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl max-w-7xl mx-auto">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)` 
                }}
              >
                {specialOffers.map((offer, index) => (
                  <div 
                    key={offer.id} 
                    className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-2 sm:px-3"
                  >
                    <div
                      className={`bg-gradient-to-r ${offer.gradient} p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden min-h-[240px] sm:min-h-[260px] lg:min-h-[280px] flex flex-col justify-between rounded-lg sm:rounded-xl shadow-lg`}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-10 lg:-translate-y-12 translate-x-8 sm:translate-x-10 lg:translate-x-12"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/10 rounded-full translate-y-6 sm:translate-y-7 lg:translate-y-8 -translate-x-6 sm:-translate-x-7 lg:-translate-x-8"></div>

                      <div className="relative z-10">
                        <Badge className="bg-white/20 text-white border-white/30 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3">
                          {offer.badge}
                        </Badge>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight">{offer.title}</h3>
                        <p className="text-xs sm:text-sm mb-1 sm:mb-2 opacity-90">{offer.subtitle}</p>
                        <p className="text-[11px] sm:text-xs mb-3 sm:mb-4 opacity-80 line-clamp-2">{offer.description}</p>
                      </div>

                      <Button
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg shadow transition-all duration-200 relative z-10 w-full sm:w-auto"
                      >
                        {offer.cta}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 z-20"
              disabled={currentSlide === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 z-20"
              disabled={currentSlide >= specialOffers.length - cardsPerView}
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
              {Array.from({ length: Math.max(1, specialOffers.length - cardsPerView + 1) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-purple-600 scale-125" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Unified Categories Display */}
          <div>
            {/* Interactive Categories and Courses Display */}
            <div>
              {/* Categories Slider */}
              <div className="mb-8 max-w-7xl mx-auto sm:mb-10 lg:mb-12">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center px-4">Browse by Category</h3>
                <div className="relative">
                  <div
                    ref={sliderRef}
                    className="flex space-x-3 md:gap-4 sm:space-x-4 overflow-x-auto scrollbar-hide pb-4 px-2 sm:px-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {(searchTerm ? filteredCategories : courseCategories).map((category) => {
                      const IconComponent = category.icon
                      const isSelected = selectedCategory === category.id
                      const isHighlighted = category.featured || category.trending

                      return (
                        <Card
                          key={category.id}
                          className={`flex-shrink-0 w-[280px] sm:w-64 lg:w-72 cursor-pointer transition-all duration-300 border-2 overflow-hidden snap-start ${
                            isSelected
                              ? `${category.borderColor} shadow-xl scale-105 bg-gradient-to-br from-white to-${category.bgColor}`
                              : isHighlighted
                                ? `${category.borderColor} hover:shadow-lg hover:scale-102 bg-gradient-to-br from-white to-${category.bgColor}`
                                : "border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102"
                          }`}
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <CardContent className="p-4 sm:p-5 lg:p-6">
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <div
                                className={`p-2 sm:p-2.5 lg:p-3 rounded-xl ${category.bgColor} transition-transform duration-300 ${
                                  isSelected ? "scale-110" : ""
                                }`}
                              >
                                <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${category.textColor}`} />
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                {category.trending && (
                                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                    Hot
                                  </Badge>
                                )}
                                {category.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <h4
                              className={`text-base sm:text-lg font-bold mb-1.5 sm:mb-2 transition-colors ${
                                isSelected || isHighlighted ? category.textColor : "text-gray-900"
                              }`}
                            >
                              {category.title}
                            </h4>
                            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2">
                              {category.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500">
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm font-medium">{category.courseCount} courses</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-xs sm:text-sm transition-all duration-300 ${
                                  isSelected
                                    ? `${category.textColor} bg-${category.bgColor}`
                                    : isHighlighted
                                      ? `${category.textColor} hover:bg-${category.bgColor}`
                                      : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                }`}
                              >
                                {isSelected ? "Selected" : "Select"}
                                <ArrowRight
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 transition-transform ${isSelected ? "rotate-90" : ""}`}
                                />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Category Slider Controls - Hidden on mobile, shown on larger screens */}
                  <button
                    onClick={() => scrollToCategory("left")}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:shadow-xl transition-all duration-200 group z-10"
                    aria-label="Scroll categories left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => scrollToCategory("right")}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:shadow-xl transition-all duration-200 group z-10"
                    aria-label="Scroll categories right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Selected Category Courses */}
              {selectedCategory && (
                <div ref={selectedCategoryRef} className="mt-8 sm:mt-12 lg:mt-16 px-2 sm:px-0">
                  {(() => {
                    const category = courseCategories.find((cat) => cat.id === selectedCategory)
                    if (!category) return null

                    // Generate sample courses for the selected category
                    const sampleCourses = Array.from({ length: category.courseCount }, (_, index) => {
                      const courseTitle = `${category.title} Course ${index + 1}`
                      const slug = `${category.id}-course-${index + 1}`.toLowerCase().replace(/\s+/g, '-')
                      return {
                        id: `${category.id}-course-${index + 1}`,
                        slug: slug,
                        title: courseTitle,
                        description: `Advanced ${category.title.toLowerCase()} training covering essential concepts and practical applications.`,
                        duration: ["1 Day", "2 Days", "3 Days", "1 Week"][Math.floor(Math.random() * 4)],
                        price: `$${(Math.random() * 2000 + 500).toFixed(0)}`,
                        rating: (4.0 + Math.random() * 1).toFixed(1),
                        instructor: [
                          "Dr. Sarah Johnson",
                          "Mark Thompson",
                          "Lisa Chen",
                          "Ahmed Al-Rashid",
                          "Jennifer Davis",
                        ][Math.floor(Math.random() * 5)],
                        venue: ["London, UK", "Dubai, UAE", "Singapore", "New York, USA", "Virtual"][
                          Math.floor(Math.random() * 5)
                        ],
                        seats: Math.floor(Math.random() * 20) + 5,
                        level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
                      }
                    })

                    return (
                      <div
                        className={`bg-gradient-to-br from-white to-${category.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 ${category.borderColor}`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                          <div className="flex items-center flex-1">
                            <div className={`p-3 sm:p-4 rounded-xl ${category.bgColor} mr-3 sm:mr-4`}>
                              <category.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${category.textColor}`} />
                            </div>
                            <div>
                              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${category.textColor} mb-1 sm:mb-2`}>
                                {category.title} Courses
                              </h3>
                              <p className="text-sm sm:text-base text-gray-600">
                                Explore our comprehensive {category.title.toLowerCase()} training programs
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCategory(null)}
                            className={`${category.borderColor} ${category.textColor} hover:bg-${category.bgColor} w-full sm:w-auto`}
                          >
                            Close
                            <X className="w-4 h-4 ml-2" />
                          </Button>
                        </div>

                        {/* Courses Slider */}
                        <div className="relative">
                          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                            {sampleCourses.map((course, index) => (
                              <Card
                                key={course.id}
                                className="flex-shrink-0 w-[280px] sm:w-72 lg:w-80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-300 snap-start"
                              >
                                <CardContent className="p-4 sm:p-5 lg:p-6">
                                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <Badge className={`${category.bgColor} ${category.textColor} text-xs`}>
                                      {course.level}
                                    </Badge>
                                    <div className="text-right">
                                      <div className="text-lg sm:text-xl font-bold text-gray-900">{course.price}</div>
                                      <div className="text-[10px] sm:text-xs text-gray-500">{course.seats} seats left</div>
                                    </div>
                                  </div>

                                  <Link href={`/courses/${course.slug}`}>
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">{course.title}</h4>
                                  </Link>
                                  <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                    {course.description}
                                  </p>

                                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                      {course.duration}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                      {course.venue}
                                    </div>
                                    <div className="flex items-center">
                                      <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-yellow-400 fill-current" />
                                      {course.rating} • {course.instructor}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Link href={`/courses/${course.slug}`} className="flex-1">
                                      <Button
                                        size="sm"
                                        className={`w-full bg-gradient-to-r ${category.color} text-white hover:opacity-90 text-xs sm:text-sm`}
                                      >
                                        Book Now
                                      </Button>
                                    </Link>
                                    <Link href={`/courses/${course.slug}`}>
                                      <Button variant="outline" size="sm" className="px-2 sm:px-3">
                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* View All Courses Button */}
                        <div className="text-center mt-6 sm:mt-8">
                          <Button
                            size="lg"
                            className={`bg-gradient-to-r ${category.color} text-white hover:opacity-90 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto`}
                            onClick={() => {
                              const categoryParam = encodeURIComponent(category.title)
                              router.push(`/courses?category=${categoryParam}`)
                            }}
                          >
                            View All {category.courseCount} {category.title} Courses
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Default State - Show Top Courses */}
              {/* {!selectedCategory && (
                <div className="mt-8 sm:mt-12 lg:mt-16">
                  <div className="text-center mb-6 sm:mb-8 lg:mb-10 px-4">
                    <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Top Courses</h3>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Discover our most popular and highly-rated training programs</p>
                  </div>
                  <div className="relative overflow-hidden px-2 sm:px-4" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}> */}
                    {/* Gradient overlays for fade effect */}
                    {/* <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" /> */}
                    
                    {/* Infinite scrolling carousel */}
                    {/* <div 
                      className="flex gap-4 sm:gap-5 lg:gap-6 course-carousel"
                      style={{
                        animation: 'scroll 30s linear infinite',
                        animationPlayState: isAutoPlaying ? 'running' : 'paused',
                      }}
                    > */}
                      {/* First set of courses */}
                      {/* {[
                      {
                        id: 'project-management-professional',
                        slug: 'project-management-professional',
                        title: 'Project Management Professional (PMP)',
                        description: 'Master project management methodologies and earn your PMP certification with industry-leading experts.',
                        duration: '5 Days',
                        category: 'Project Management',
                        price: 2499,
                        rating: 4.9,
                        instructor: 'Dr. Sarah Johnson',
                        venue: 'London, UK',
                        seats: 12,
                        level: 'Advanced',
                        featured: true,
                        trending: true,
                      },
                      {
                        id: 'leadership-excellence',
                        slug: 'leadership-excellence',
                        title: 'Leadership Excellence Masterclass',
                        description: 'Transform your leadership skills with proven methodologies and real-world case studies.',
                        duration: '3 Days',
                        category: 'Management & Leadership',
                        price: 1999,
                        rating: 4.8,
                        instructor: 'Mark Thompson',
                        venue: 'Dubai, UAE',
                        seats: 15,
                        level: 'Intermediate',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'digital-marketing-strategy',
                        slug: 'digital-marketing-strategy',
                        title: 'Advanced Digital Marketing Strategy',
                        description: 'Master the latest digital marketing tools, analytics, and growth hacking techniques.',
                        duration: '4 Days',
                        category: 'Marketing',
                        price: 1799,
                        rating: 4.7,
                        instructor: 'Lisa Chen',
                        venue: 'Singapore',
                        seats: 20,
                        level: 'Intermediate',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'financial-analysis',
                        slug: 'financial-analysis',
                        title: 'Corporate Financial Analysis',
                        description: 'Comprehensive financial modeling, valuation techniques, and risk assessment strategies.',
                        duration: '5 Days',
                        category: 'Finance & Accounting',
                        price: 2299,
                        rating: 4.9,
                        instructor: 'Ahmed Al-Rashid',
                        venue: 'Virtual',
                        seats: 30,
                        level: 'Advanced',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'agile-scrum-master',
                        slug: 'agile-scrum-master',
                        title: 'Agile Scrum Master Certification',
                        description: 'Become a certified Agile Scrum Master with hands-on training and practical exercises.',
                        duration: '2 Days',
                        category: 'Project Management',
                        price: 1599,
                        rating: 4.8,
                        instructor: 'Jennifer Davis',
                        venue: 'New York, USA',
                        seats: 18,
                        level: 'Beginner',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'enterprise-risk-management',
                        slug: 'enterprise-risk-management',
                        title: 'Enterprise Risk Management',
                        description: 'Comprehensive risk management framework for organizational resilience and compliance.',
                        duration: '4 Days',
                        category: 'Risk Management',
                        price: 2199,
                        rating: 4.6,
                        instructor: 'Dr. Sarah Johnson',
                        venue: 'London, UK',
                        seats: 14,
                        level: 'Advanced',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'data-analytics-excellence',
                        slug: 'data-analytics-excellence',
                        title: 'Data Analytics Excellence',
                        description: 'Master data analysis, visualization, and business intelligence tools for data-driven decisions.',
                        duration: '3 Days',
                        category: 'Information Technology',
                        price: 1899,
                        rating: 4.7,
                        instructor: 'Mark Thompson',
                        venue: 'Virtual',
                        seats: 25,
                        level: 'Intermediate',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'supply-chain-optimization',
                        slug: 'supply-chain-optimization',
                        title: 'Supply Chain Optimization',
                        description: 'Advanced supply chain strategies, logistics management, and procurement excellence.',
                        duration: '4 Days',
                        category: 'Purchasing Management',
                        price: 2099,
                        rating: 4.8,
                        instructor: 'Lisa Chen',
                        venue: 'Dubai, UAE',
                        seats: 16,
                        level: 'Intermediate',
                        featured: true,
                        trending: false,
                      },
                      ].map((course, idx) => {
                        const category = courseCategories.find(cat => cat.title.includes(course.category.split(' ')[0])) || courseCategories[0]
                        const isHighlighted = course.featured || course.trending

                        return (
                          <Card
                            key={`course-1-${course.id}-${idx}`}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-300 overflow-hidden flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
                          >
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                              <div className="flex gap-1.5 sm:gap-2">
                                {course.trending && (
                                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" />
                                    Hot
                                  </Badge>
                                )}
                                {course.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline fill-current" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                {course.level}
                              </Badge>
                            </div>

                            <Link href={`/courses/${course.slug}`}>
                              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                {course.title}
                              </h4>
                            </Link>
                            
                            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2">
                              {course.description}
                            </p>

                            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-[11px] sm:text-xs text-gray-600">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="line-clamp-1">{course.venue}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" />
                                <span>{course.rating} • {course.instructor}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t">
                              <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-bold text-gray-900">${course.price.toLocaleString()}</span>
                                <span className="text-[10px] sm:text-xs text-gray-500">{course.seats} seats left</span>
                              </div>
                              <Link href={`/courses/${course.slug}`}>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 font-semibold text-xs sm:text-sm px-3 sm:px-4"
                                >
                                  View Details
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )
                      })} */}
                      
                      {/* Duplicate set for seamless infinite loop */}
                      {/* {[
                      {
                        id: 'project-management-professional',
                        slug: 'project-management-professional',
                        title: 'Project Management Professional (PMP)',
                        description: 'Master project management methodologies and earn your PMP certification with industry-leading experts.',
                        duration: '5 Days',
                        category: 'Project Management',
                        price: 2499,
                        rating: 4.9,
                        instructor: 'Dr. Sarah Johnson',
                        venue: 'London, UK',
                        seats: 12,
                        level: 'Advanced',
                        featured: true,
                        trending: true,
                      },
                      {
                        id: 'leadership-excellence',
                        slug: 'leadership-excellence',
                        title: 'Leadership Excellence Masterclass',
                        description: 'Transform your leadership skills with proven methodologies and real-world case studies.',
                        duration: '3 Days',
                        category: 'Management & Leadership',
                        price: 1999,
                        rating: 4.8,
                        instructor: 'Mark Thompson',
                        venue: 'Dubai, UAE',
                        seats: 15,
                        level: 'Intermediate',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'digital-marketing-strategy',
                        slug: 'digital-marketing-strategy',
                        title: 'Advanced Digital Marketing Strategy',
                        description: 'Master the latest digital marketing tools, analytics, and growth hacking techniques.',
                        duration: '4 Days',
                        category: 'Marketing',
                        price: 1799,
                        rating: 4.7,
                        instructor: 'Lisa Chen',
                        venue: 'Singapore',
                        seats: 20,
                        level: 'Intermediate',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'financial-analysis',
                        slug: 'financial-analysis',
                        title: 'Corporate Financial Analysis',
                        description: 'Comprehensive financial modeling, valuation techniques, and risk assessment strategies.',
                        duration: '5 Days',
                        category: 'Finance & Accounting',
                        price: 2299,
                        rating: 4.9,
                        instructor: 'Ahmed Al-Rashid',
                        venue: 'Virtual',
                        seats: 30,
                        level: 'Advanced',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'agile-scrum-master',
                        slug: 'agile-scrum-master',
                        title: 'Agile Scrum Master Certification',
                        description: 'Become a certified Agile Scrum Master with hands-on training and practical exercises.',
                        duration: '2 Days',
                        category: 'Project Management',
                        price: 1599,
                        rating: 4.8,
                        instructor: 'Jennifer Davis',
                        venue: 'New York, USA',
                        seats: 18,
                        level: 'Beginner',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'enterprise-risk-management',
                        slug: 'enterprise-risk-management',
                        title: 'Enterprise Risk Management',
                        description: 'Comprehensive risk management framework for organizational resilience and compliance.',
                        duration: '4 Days',
                        category: 'Risk Management',
                        price: 2199,
                        rating: 4.6,
                        instructor: 'Dr. Sarah Johnson',
                        venue: 'London, UK',
                        seats: 14,
                        level: 'Advanced',
                        featured: true,
                        trending: false,
                      },
                      {
                        id: 'data-analytics-excellence',
                        slug: 'data-analytics-excellence',
                        title: 'Data Analytics Excellence',
                        description: 'Master data analysis, visualization, and business intelligence tools for data-driven decisions.',
                        duration: '3 Days',
                        category: 'Information Technology',
                        price: 1899,
                        rating: 4.7,
                        instructor: 'Mark Thompson',
                        venue: 'Virtual',
                        seats: 25,
                        level: 'Intermediate',
                        featured: false,
                        trending: true,
                      },
                      {
                        id: 'supply-chain-optimization',
                        slug: 'supply-chain-optimization',
                        title: 'Supply Chain Optimization',
                        description: 'Advanced supply chain strategies, logistics management, and procurement excellence.',
                        duration: '4 Days',
                        category: 'Purchasing Management',
                        price: 2099,
                        rating: 4.8,
                        instructor: 'Lisa Chen',
                        venue: 'Dubai, UAE',
                        seats: 16,
                        level: 'Intermediate',
                        featured: true,
                        trending: false,
                      },
                      ].map((course, idx) => {
                        const category = courseCategories.find(cat => cat.title.includes(course.category.split(' ')[0])) || courseCategories[0]
                        const isHighlighted = course.featured || course.trending

                        return (
                          <Card
                            key={`course-2-${course.id}-${idx}`}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-300 overflow-hidden flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
                          >
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex gap-1.5 sm:gap-2">
                                  {course.trending && (
                                    <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" />
                                      Hot
                                    </Badge>
                                  )}
                                  {course.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                  {course.level}
                                </Badge>
                              </div>

                              <Link href={`/courses/${course.slug}`}>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                  {course.title}
                                </h4>
                              </Link>
                              
                              <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                {course.description}
                              </p>

                              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-[11px] sm:text-xs text-gray-600">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span className="line-clamp-1">{course.venue}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" />
                                  <span>{course.rating} • {course.instructor}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t">
                                <div className="flex flex-col">
                                  <span className="text-lg sm:text-xl font-bold text-gray-900">${course.price.toLocaleString()}</span>
                                  <span className="text-[10px] sm:text-xs text-gray-500">{course.seats} seats left</span>
                                </div>
                                <Link href={`/courses/${course.slug}`}>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 font-semibold text-xs sm:text-sm px-3 sm:px-4"
                                  >
                                    View Details
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Simplified Call to Action */}
          {/* <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden max-w-4xl mx-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Transform Your Career?</h3>
                <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                  Join thousands of professionals who have advanced their careers with our world-class training
                  programs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Browse All Courses
                    <BookOpen className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm font-semibold px-6 py-3 rounded-xl"
                  >
                    Contact Experts
                    <MessageSquare className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
