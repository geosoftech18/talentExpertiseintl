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

  const filteredTestimonials = testimonials.filter(
    (testimonial) => selectedCategory === "All Categories" || testimonial.category === selectedCategory,
  )

  const testimonialsPerSlide = viewMode === "carousel" ? 3 : filteredTestimonials.length
  const totalSlides = Math.ceil(filteredTestimonials.length / testimonialsPerSlide)

  useEffect(() => {
    if (!isAutoPlaying || viewMode === "grid") return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSlides, viewMode])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
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
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const TestimonialCard = ({ testimonial, featured = false }: { testimonial: any; featured?: boolean }) => (
    <Card
      className={`group hover:shadow-2xl transition-all duration-500 border-2 overflow-hidden ${
        featured
          ? "border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-xl scale-105"
          : "border-gray-200 hover:border-purple-200 hover:-translate-y-2"
      }`}
    >
      <CardContent className="p-6 relative">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 opacity-10">
          <Quote className="w-12 h-12 text-purple-600" />
        </div>

        {/* Course Badge */}
        <div className="mb-4">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium mb-2">
            {testimonial.category}
          </Badge>
          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{testimonial.course}</h4>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex space-x-1 mr-2">{renderStars(testimonial.rating)}</div>
          <span className="text-sm font-medium text-gray-600">({testimonial.rating}.0)</span>
        </div>

        {/* Review */}
        <blockquote className="text-gray-700 mb-6 leading-relaxed line-clamp-4 relative z-10">
          "{testimonial.review}"
        </blockquote>

        {/* Reviewer Info */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12 border-2 border-purple-200">
            <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h5 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h5>
              {testimonial.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-xs text-gray-600 mb-1">{testimonial.position}</p>
            <p className="text-xs text-gray-500 mb-2">{testimonial.company}</p>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>{testimonial.courseDate}</span>
              <span>•</span>
              <span>{testimonial.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Quote className="w-8 h-8 text-purple-600 mr-3" />
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 px-4 py-2 text-lg">
              Client Testimonials
            </Badge>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover why thousands of professionals trust us for their career development. Real stories from real people
            who transformed their careers with our training programs.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="text-center p-6 border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <IconComponent className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </Card>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category)
                  setCurrentSlide(0)
                }}
                className={`transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white shadow-lg"
                    : "border-purple-200 !text-purple-700 hover:bg-purple-50"
                }`}
              >
                {category}
              </Button>
            ))}
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
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </div> */}
        </div>

        {/* Testimonials Display */}
        {viewMode === "carousel" ? (
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }, (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid lg:grid-cols-3 gap-6 px-4">
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
            </div>

            {/* Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
              disabled={totalSlides <= 1}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
              disabled={totalSlides <= 1}
            >
              <ChevronRight className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
            </button>

            {/* Slide Indicators */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index)
                      setIsAutoPlaying(false)
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-purple-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Success Stories?</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your career with our world-class training programs and become our next success story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Browse Our Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold px-8 py-4 text-lg rounded-xl"
            >
              Read More Reviews
              <Star className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
