"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Calendar, MapPin, BookOpen, Users, Star, ChevronDown, Sparkles } from "lucide-react"
import CalendarView from "./calendar-view"

interface Course {
  category: string
}

// Comprehensive venues list matching the venues page
const venues = [
  // Asia
  { id: "bali", name: "Bali, Indonesia", flag: "🇮🇩", upcoming: 8 },
  { id: "bangalore", name: "Bangalore, India", flag: "🇮🇳", upcoming: 12 },
  { id: "bangkok", name: "Bangkok, Thailand", flag: "🇹🇭", upcoming: 10 },
  { id: "dubai", name: "Dubai, UAE", flag: "🇦🇪", upcoming: 15 },
  { id: "hongkong", name: "Hong Kong", flag: "🇭🇰", upcoming: 9 },
  { id: "kualalumpur", name: "Kuala Lumpur, Malaysia", flag: "🇲🇾", upcoming: 11 },
  { id: "newdelhi", name: "New Delhi, India", flag: "🇮🇳", upcoming: 13 },
  { id: "singapore", name: "Singapore", flag: "🇸🇬", upcoming: 18 },
  { id: "alkhobar", name: "Al Khobar, Saudi Arabia", flag: "🇸🇦", upcoming: 7 },
  { id: "doha", name: "Doha, Qatar", flag: "🇶🇦", upcoming: 10 },
  { id: "jeddah", name: "Jeddah, Saudi Arabia", flag: "🇸🇦", upcoming: 8 },
  { id: "manama", name: "Manama, Bahrain", flag: "🇧🇭", upcoming: 6 },
  { id: "muscat", name: "Muscat, Oman", flag: "🇴🇲", upcoming: 7 },
  { id: "riyadh", name: "Riyadh, Saudi Arabia", flag: "🇸🇦", upcoming: 14 },
  // Africa
  { id: "accra", name: "Accra, Ghana", flag: "🇬🇭", upcoming: 5 },
  { id: "capetown", name: "Cape Town, South Africa", flag: "🇿🇦", upcoming: 9 },
  { id: "entebbe", name: "Entebbe, Uganda", flag: "🇺🇬", upcoming: 4 },
  { id: "harare", name: "Harare, Zimbabwe", flag: "🇿🇼", upcoming: 3 },
  { id: "kigali", name: "Kigali, Rwanda", flag: "🇷🇼", upcoming: 5 },
  { id: "marrakesh", name: "Marrakesh, Morocco", flag: "🇲🇦", upcoming: 6 },
  { id: "nairobi", name: "Nairobi, Kenya", flag: "🇰🇪", upcoming: 8 },
  { id: "portlouis", name: "Port Louis, Mauritius", flag: "🇲🇺", upcoming: 4 },
  { id: "sharmelsheikh", name: "Sharm El Sheikh, Egypt", flag: "🇪🇬", upcoming: 7 },
  { id: "victoria", name: "Victoria, Seychelles", flag: "🇸🇨", upcoming: 3 },
  { id: "zanzibar", name: "Zanzibar, Tanzania", flag: "🇹🇿", upcoming: 4 },
  { id: "casablanca", name: "Casablanca, Morocco", flag: "🇲🇦", upcoming: 8 },
  { id: "addisababa", name: "Addis Ababa, Ethiopia", flag: "🇪🇹", upcoming: 5 },
  { id: "cairo", name: "Cairo, Egypt", flag: "🇪🇬", upcoming: 12 },
  { id: "abuja", name: "Abuja, Nigeria", flag: "🇳🇬", upcoming: 7 },
  // Europe
  { id: "amsterdam", name: "Amsterdam, Netherlands", flag: "🇳🇱", upcoming: 10 },
  { id: "barcelona", name: "Barcelona, Spain", flag: "🇪🇸", upcoming: 11 },
  { id: "edinburgh", name: "Edinburgh, UK", flag: "🇬🇧", upcoming: 9 },
  { id: "frankfurt", name: "Frankfurt, Germany", flag: "🇩🇪", upcoming: 12 },
  { id: "geneva", name: "Geneva, Switzerland", flag: "🇨🇭", upcoming: 8 },
  { id: "istanbul", name: "Istanbul, Turkey", flag: "🇹🇷", upcoming: 13 },
  { id: "london", name: "London, UK", flag: "🇬🇧", upcoming: 20 },
  { id: "marbella", name: "Marbella, Spain", flag: "🇪🇸", upcoming: 6 },
  { id: "milan", name: "Milan, Italy", flag: "🇮🇹", upcoming: 10 },
  { id: "munich", name: "Munich, Germany", flag: "🇩🇪", upcoming: 11 },
  { id: "paris", name: "Paris, France", flag: "🇫🇷", upcoming: 16 },
  { id: "prague", name: "Prague, Czech Republic", flag: "🇨🇿", upcoming: 8 },
  { id: "rome", name: "Rome, Italy", flag: "🇮🇹", upcoming: 9 },
  { id: "vienna", name: "Vienna, Austria", flag: "🇦🇹", upcoming: 10 },
  { id: "oxford", name: "Oxford, UK", flag: "🇬🇧", upcoming: 7 },
  { id: "athens", name: "Athens, Greece", flag: "🇬🇷", upcoming: 8 },
  { id: "baku", name: "Baku, Azerbaijan", flag: "🇦🇿", upcoming: 5 },
  { id: "lisbon", name: "Lisbon, Portugal", flag: "🇵🇹", upcoming: 9 },
  { id: "liverpool", name: "Liverpool, UK", flag: "🇬🇧", upcoming: 6 },
  // North America
  { id: "maryland", name: "Maryland, USA", flag: "🇺🇸", upcoming: 8 },
  { id: "boston", name: "Boston, USA", flag: "🇺🇸", upcoming: 14 },
  { id: "california", name: "California, USA", flag: "🇺🇸", upcoming: 16 },
  { id: "chicago", name: "Chicago, USA", flag: "🇺🇸", upcoming: 12 },
  { id: "miami", name: "Miami, USA", flag: "🇺🇸", upcoming: 10 },
  { id: "houston", name: "Houston, USA", flag: "🇺🇸", upcoming: 11 },
  { id: "toronto", name: "Toronto, Canada", flag: "🇨🇦", upcoming: 13 },
  { id: "newyork", name: "New York, USA", flag: "🇺🇸", upcoming: 18 },
  // Virtual
  { id: "virtual", name: "Virtual Training", flag: "🌐", upcoming: 30 },
]

const months = [
  { id: "jan", name: "January 2024", courses: 18 },
  { id: "feb", name: "February 2024", courses: 22 },
  { id: "mar", name: "March 2024", courses: 25 },
  { id: "apr", name: "April 2024", courses: 20 },
  { id: "may", name: "May 2024", courses: 28 },
  { id: "jun", name: "June 2024", courses: 24 },
]

const popularSearches = [
  "Leadership Excellence",
  "Public Speaking",
  "Project Management",
  "Digital Marketing",
  "Financial Analysis",
  "Team Building",
]

export default function CourseFilterSection() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch courses to get available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/courses?limit=1000')
        const result = await response.json()
        if (result.success && result.data) {
          setCourses(result.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Extract unique categories from courses data
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>()
    courses.forEach((course) => {
      if (course.category) {
        categorySet.add(course.category)
      }
    })
    return Array.from(categorySet).sort()
  }, [courses])

  // Category color mapping (fallback if category doesn't match)
  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      "Leadership & Management": "bg-purple-100 text-purple-800",
      "Communication Skills": "bg-blue-100 text-blue-800",
      "Sales & Marketing": "bg-green-100 text-green-800",
      "Finance & Accounting": "bg-orange-100 text-orange-800",
      "Human Resources": "bg-pink-100 text-pink-800",
      "Project Management": "bg-indigo-100 text-indigo-800",
      "IT & Technology": "bg-cyan-100 text-cyan-800",
      "Personal Development": "bg-emerald-100 text-emerald-800",
    }
    return colorMap[categoryName] || "bg-gray-100 text-gray-800"
  }

  // Count courses per category
  const getCategoryCount = (categoryName: string) => {
    return courses.filter((course) => course.category === categoryName).length
  }

  const handleSearch = () => {
    const filters = []
    if (selectedCategory) filters.push(`Category: ${selectedCategory}`)
    if (selectedVenue) filters.push(`Venue: ${venues.find((v) => v.id === selectedVenue)?.name}`)
    if (selectedMonth) filters.push(`Month: ${months.find((m) => m.id === selectedMonth)?.name}`)
    if (searchQuery) filters.push(`Search: ${searchQuery}`)

    setActiveFilters(filters)

    // Build URL with query parameters
    const params = new URLSearchParams()
    
    // Category is already the category name (not an ID)
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    // Map venue ID to full venue name (for database matching)
    if (selectedVenue) {
      const venueName = venues.find((v) => v.id === selectedVenue)?.name
      if (venueName) {
        params.append('venue', venueName)
      }
    }
    
    // Add search query
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim())
    }
    
    // Navigate to courses page with filters
    const queryString = params.toString()
    router.push(`/courses${queryString ? `?${queryString}` : ''}`)
  }

  const handleReset = () => {
    setSelectedCategory("")
    setSelectedVenue("")
    setSelectedMonth("")
    setSearchQuery("")
    setActiveFilters([])
  }

  const removeFilter = (filterToRemove: string) => {
    // Reset corresponding state based on filter type
    if (filterToRemove.startsWith("Category:")) {
      setSelectedCategory("")
    }
    if (filterToRemove.startsWith("Venue:")) {
      setSelectedVenue("")
    }
    if (filterToRemove.startsWith("Month:")) {
      setSelectedMonth("")
    }
    if (filterToRemove.startsWith("Search:")) {
      setSearchQuery("")
    }
    
    // Remove from active filters
    setActiveFilters((prev) => prev.filter((filter) => filter !== filterToRemove))
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
              Find Your Perfect Course
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Discover World-Class Training</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search through our comprehensive catalog of professional development courses, delivered by expert trainers
            in premium venues worldwide.
          </p>
        </div>

        {/* Main Filter Card */}
        <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">246</div>
                <div className="text-sm text-purple-700">Total Courses</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">36+</div>
                <div className="text-sm text-blue-700">Global Cities</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">100+</div>
                <div className="text-sm text-green-700">Expert Trainers</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">4.9</div>
                <div className="text-sm text-orange-700">Average Rating</div>
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for courses, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/50">
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Choose Category"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {loadingCategories ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : availableCategories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      availableCategories.map((categoryName) => (
                        <SelectItem key={categoryName} value={categoryName}>
                          <div className="flex items-center justify-between w-full">
                            <span>{categoryName}</span>
                            <Badge className={`ml-2 ${getCategoryColor(categoryName)}`}>
                              {getCategoryCount(categoryName)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Venue
                </label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/50">
                    <SelectValue placeholder="Choose Venue" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center">
                            <span className="mr-2">{venue.flag}</span>
                            {venue.name}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {venue.upcoming} upcoming
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-12 w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/50">
                    <SelectValue placeholder="Choose Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {months.map((month) => (
                      <SelectItem key={month.id} value={month.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{month.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {month.courses} courses
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3">
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Courses
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl font-semibold"
                >
                  <X className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex gap-2">
                {/* <Button
                  onClick={() => setShowCalendar(!showCalendar)}
                  variant="outline"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {showCalendar ? "Hide Calendar" : "View Calendar"}
                </Button> */}

                <Button
                  variant="ghost"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {isAdvancedOpen && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Search Options</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Duration</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Course Duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="1day">1 Day</SelectItem>
                        <SelectItem value="2days">2 Days</SelectItem>
                        <SelectItem value="3days">3 Days</SelectItem>
                        <SelectItem value="week">1 Week</SelectItem>
                        <SelectItem value="custom">Custom Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Price Range" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="under1000">Under $1,000</SelectItem>
                        <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                        <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                        <SelectItem value="over5000">Over $5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="max-w-6xl mx-auto mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        <div className="max-w-6xl mx-auto mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Popular Searches</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(search)
                  // Navigate to courses page with search query
                  const params = new URLSearchParams()
                  params.append('search', search)
                  router.push(`/courses?${params.toString()}`)
                }}
                className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Conditional Calendar Section */}
      {/* {showCalendar && (
        <div className="transition-all duration-500 ease-in-out">
          <CalendarView />
        </div>
      )} */}
    </section>
  )
}
