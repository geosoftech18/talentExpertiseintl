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
  startDate?: string
}

interface Venue {
  id: string
  name: string
  flag: string
}

// Country to ISO code mapping for flag emojis
const countryToISOCode: { [key: string]: string } = {
  'Indonesia': 'id', 'India': 'in', 'Thailand': 'th', 'UAE': 'ae', 'United Arab Emirates': 'ae',
  'Malaysia': 'my', 'Saudi Arabia': 'sa', 'Qatar': 'qa', 'Bahrain': 'bh', 'Oman': 'om',
  'China': 'cn', 'Japan': 'jp', 'South Korea': 'kr', 'Philippines': 'ph', 'Vietnam': 'vn',
  'Singapore': 'sg', 'Hong Kong': 'hk', 'Taiwan': 'tw', 'Bangladesh': 'bd', 'Pakistan': 'pk',
  'Sri Lanka': 'lk', 'Nepal': 'np', 'Myanmar': 'mm', 'Cambodia': 'kh', 'Laos': 'la',
  'Kuwait': 'kw', 'Jordan': 'jo', 'Lebanon': 'lb', 'Israel': 'il', 'Iraq': 'iq',
  'Iran': 'ir', 'Afghanistan': 'af', 'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Mongolia': 'mn',
  // Africa
  'Ghana': 'gh', 'South Africa': 'za', 'Uganda': 'ug', 'Zimbabwe': 'zw', 'Rwanda': 'rw',
  'Morocco': 'ma', 'Kenya': 'ke', 'Mauritius': 'mu', 'Egypt': 'eg', 'Seychelles': 'sc',
  'Tanzania': 'tz', 'Ethiopia': 'et', 'Nigeria': 'ng', 'Algeria': 'dz', 'Tunisia': 'tn',
  'Libya': 'ly', 'Sudan': 'sd', 'Senegal': 'sn', 'Ivory Coast': 'ci',
  'Cameroon': 'cm', 'Angola': 'ao', 'Mozambique': 'mz', 'Madagascar': 'mg', 'Botswana': 'bw',
  'Namibia': 'na', 'Zambia': 'zm', 'Malawi': 'mw',
  // Europe
  'Netherlands': 'nl', 'Spain': 'es', 'UK': 'gb', 'United Kingdom': 'gb', 'Germany': 'de',
  'Switzerland': 'ch', 'Turkey': 'tr', 'Italy': 'it', 'France': 'fr', 'Czech Republic': 'cz',
  'Austria': 'at', 'Greece': 'gr', 'Azerbaijan': 'az', 'Portugal': 'pt', 'Belgium': 'be',
  'Poland': 'pl', 'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi',
  'Ireland': 'ie', 'Romania': 'ro', 'Hungary': 'hu', 'Slovakia': 'sk',
  'Croatia': 'hr', 'Serbia': 'rs', 'Bulgaria': 'bg', 'Ukraine': 'ua', 'Russia': 'ru',
  // North America
  'USA': 'us', 'US': 'us', 'United States of America': 'us', 'United States': 'us', 'Canada': 'ca',
  'Mexico': 'mx', 'Costa Rica': 'cr', 'Panama': 'pa', 'Jamaica': 'jm', 'Cuba': 'cu',
  // South America
  'Brazil': 'br', 'Argentina': 'ar', 'Chile': 'cl', 'Colombia': 'co', 'Peru': 'pe',
  'Ecuador': 'ec', 'Venezuela': 've', 'Uruguay': 'uy', 'Paraguay': 'py', 'Bolivia': 'bo',
  // Oceania
  'Australia': 'au', 'New Zealand': 'nz', 'Fiji': 'fj', 'Papua New Guinea': 'pg',
}

// Function to get country ISO code from country name
const getCountryCode = (country: string): string => {
  if (!country) return 'xx'
  
  const normalizedCountry = country.trim()
  
  // Direct lookup
  if (countryToISOCode[normalizedCountry]) {
    return countryToISOCode[normalizedCountry]
  }
  
  // Case-insensitive lookup
  const lowerCountry = normalizedCountry.toLowerCase()
  for (const [key, code] of Object.entries(countryToISOCode)) {
    if (key.toLowerCase() === lowerCountry) {
      return code
    }
  }
  
  // Partial match for common variations
  if (lowerCountry.includes('united states') || lowerCountry.includes('usa') || lowerCountry.includes('u.s.')) {
    return 'us'
  }
  if (lowerCountry.includes('united kingdom') || lowerCountry.includes('uk') || lowerCountry.includes('britain')) {
    return 'gb'
  }
  if (lowerCountry.includes('uae') || lowerCountry.includes('emirates')) {
    return 'ae'
  }
  
  return 'xx' // Unknown country
}

// Function to convert ISO country code to flag emoji
const getFlagEmoji = (isoCode: string): string => {
  if (isoCode === 'xx' || !isoCode) return '🌐'
  
  // Convert ISO code to flag emoji using regional indicator symbols
  const code = isoCode.toLowerCase().slice(0, 2)
  if (code.length !== 2) return '🌐'
  
  const codePoints = code
    .split('')
    .map(char => 127397 + char.charCodeAt(0)) // Regional Indicator Symbol Letter A (0x1F1E6) - 'A' (0x41) = 127397
  
  return String.fromCodePoint(...codePoints)
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
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
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)

  // Fetch courses to get available categories
  // Fetch with includeExpired=true to match course finder page behavior
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/courses?limit=10000&includeExpired=true')
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

  // Fetch venues from database
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingVenues(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (result.success && result.data) {
          // Filter only active venues and map to our format
          const activeVenues: Venue[] = result.data
            .filter((v: any) => v.status === 'Active')
            .map((v: any) => {
              const countryCode = getCountryCode(v.country || '')
              const flag = getFlagEmoji(countryCode)
              const name = v.name || `${v.city || ''}, ${v.country || ''}`.trim()
              const id = v.city 
                ? `${v.city.toLowerCase().replace(/\s+/g, '')}-${v.country?.toLowerCase().replace(/\s+/g, '') || 'unknown'}`
                : String(v.id)
              
              return {
                id,
                name,
                flag,
              }
            })
            .filter((v: Venue) => v.name) // Only include venues with a name
          
          // Add Virtual Training option
          activeVenues.push({
            id: 'virtual',
            name: 'Virtual Training',
            flag: '🌐',
          })
          
          setVenues(activeVenues)
        }
      } catch (err) {
        console.error('Error fetching venues:', err)
        // Fallback to empty array or add Virtual Training only
        setVenues([{
          id: 'virtual',
          name: 'Virtual Training',
          flag: '🌐',
        }])
      } finally {
        setLoadingVenues(false)
      }
    }

    fetchVenues()
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

  // Generate months with dynamic course counts
  const months = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    return monthNames.map((monthName, index) => {
      // Count courses for this month (check if startDate falls in this month)
      const courseCount = courses.filter((course) => {
        if (!course.startDate) return false
        try {
          const courseDate = new Date(course.startDate)
          return courseDate.getMonth() === index && courseDate.getFullYear() >= currentYear
        } catch {
          return false
        }
      }).length

      return {
        id: monthName.toLowerCase().substring(0, 3),
        name: monthName,
        monthIndex: index,
        courses: courseCount,
      }
    })
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

  // Count courses per category (only non-expired courses)
  const getCategoryCount = (categoryName: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
    
    return courses.filter((course) => {
      // Must match the category
      if (course.category !== categoryName) return false
      
      // Check if course has a startDate and it's not expired
      if (course.startDate) {
        try {
          const courseDate = new Date(course.startDate)
          courseDate.setHours(0, 0, 0, 0)
          // Only count courses with startDate in the future (not expired)
          return courseDate >= today
        } catch {
          // If date parsing fails, exclude the course
          return false
        }
      }
      
      // If no startDate, exclude the course (can't determine if expired)
      return false
    }).length
  }

  const handleSearch = () => {
    const filters = []
    if (selectedCategory) filters.push(`Category: ${selectedCategory}`)
    if (selectedVenue) filters.push(`Venue: ${venues.find((v) => v.id === selectedVenue)?.name}`)
    if (selectedMonth) {
      const month = months.find((m) => m.id === selectedMonth)
      if (month) filters.push(`Month: ${month.name}`)
    }
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
    
    // Add month filter - convert month ID (e.g., "jan") to month index (0-11)
    if (selectedMonth) {
      const month = months.find((m) => m.id === selectedMonth)
      if (month && month.monthIndex !== undefined) {
        params.append('month', month.monthIndex.toString())
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
          <h2 className="text-2xl lg:text-5xl font-bold text-gray-900 mb-4">Discover World-Class Training</h2>
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
                <div className="text-2xl font-bold text-purple-900">1000+</div>
                <div className="text-sm text-purple-700">Total Courses</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">40+</div>
                <div className="text-sm text-blue-700">Global Cities</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">200+</div>
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
                    <SelectValue placeholder={loadingVenues ? "Loading venues..." : "Choose Venue"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {loadingVenues ? (
                      <SelectItem value="loading" disabled>
                        Loading venues...
                      </SelectItem>
                    ) : venues.length === 0 ? (
                      <SelectItem value="no-venues" disabled>
                        No venues available
                      </SelectItem>
                    ) : (
                      venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center">
                             
                              {venue.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
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
                  className="bg-gradient-to-r from-[#0A3049] to-[#0A3049] hover:from-[#0A3049] hover:to-[#0A3049] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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

                {/* <Button
                  variant="ghost"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                </Button> */}
              </div>
            </div>

            {/* Advanced Filters */}
            {/* {isAdvancedOpen && (
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
            )} */}
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
        {/* <div className="max-w-6xl mx-auto mt-8">
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
        </div> */}
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
