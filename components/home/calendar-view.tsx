"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Star, BookOpen, Video, User } from "lucide-react"
import BookingWizard from "./booking-wizard"

// Sample course data
const courseEvents = [
  {
    id: 1,
    title: "Leadership Excellence Masterclass",
    date: "2024-01-15",
    time: "09:00 - 17:00",
    duration: "1 Day",
    venue: "London, UK",
    type: "face-to-face",
    category: "Leadership",
    price: "$1,299",
    seats: 12,
    maxSeats: 20,
    rating: 4.9,
    instructor: "Dr. Sarah Johnson",
    color: "bg-purple-500",
    description: "Transform your leadership skills with our comprehensive masterclass designed for senior executives.",
  },
  {
    id: 2,
    title: "Digital Marketing Strategy",
    date: "2024-01-16",
    time: "10:00 - 16:00",
    duration: "1 Day",
    venue: "Virtual",
    type: "virtual",
    category: "Marketing",
    price: "$899",
    seats: 8,
    maxSeats: 25,
    rating: 4.8,
    instructor: "Mark Thompson",
    color: "bg-blue-500",
    description: "Master the latest digital marketing strategies and tools to drive business growth.",
  },
  {
    id: 3,
    title: "Project Management Professional",
    date: "2024-01-18",
    time: "09:00 - 17:00",
    duration: "3 Days",
    venue: "Dubai, UAE",
    type: "face-to-face",
    category: "Project Management",
    price: "$2,499",
    seats: 5,
    maxSeats: 15,
    rating: 4.9,
    instructor: "Ahmed Al-Rashid",
    color: "bg-green-500",
    description: "Comprehensive PMP certification preparation with hands-on project management techniques.",
  },
  {
    id: 4,
    title: "Financial Analysis & Modeling",
    date: "2024-01-22",
    time: "09:30 - 17:30",
    duration: "2 Days",
    venue: "Singapore",
    type: "face-to-face",
    category: "Finance",
    price: "$1,899",
    seats: 15,
    maxSeats: 18,
    rating: 4.7,
    instructor: "Lisa Chen",
    color: "bg-orange-500",
    description: "Advanced financial modeling techniques for investment analysis and business valuation.",
  },
  {
    id: 5,
    title: "Public Speaking Mastery",
    date: "2024-01-25",
    time: "10:00 - 15:00",
    duration: "1 Day",
    venue: "Virtual",
    type: "virtual",
    category: "Communication",
    price: "$699",
    seats: 20,
    maxSeats: 30,
    rating: 4.8,
    instructor: "Robert Williams",
    color: "bg-pink-500",
    description: "Overcome speaking anxiety and deliver compelling presentations with confidence.",
  },
  {
    id: 6,
    title: "HR Analytics & People Management",
    date: "2024-01-29",
    time: "09:00 - 17:00",
    duration: "2 Days",
    venue: "New York, USA",
    type: "face-to-face",
    category: "Human Resources",
    price: "$1,799",
    seats: 10,
    maxSeats: 16,
    rating: 4.9,
    instructor: "Jennifer Davis",
    color: "bg-indigo-500",
    description: "Leverage data analytics to make strategic HR decisions and improve employee engagement.",
  },
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)) // January 2024
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [bookingCourse, setBookingCourse] = useState<any>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getCoursesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return courseEvents.filter((course) => {
      const matchesDate = course.date === dateStr
      const matchesCategory =
        filterCategory === "all" || course.category.toLowerCase().includes(filterCategory.toLowerCase())
      return matchesDate && matchesCategory
    })
  }

  const handleBookNow = (course: any) => {
    setBookingCourse(course)
    setIsBookingOpen(true)
    setSelectedCourse(null)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 lg:h-32"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const courses = getCoursesForDate(day)
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear()

      days.push(
        <div
          key={day}
          className={`h-24 lg:h-32 border border-gray-200 p-1 lg:p-2 relative overflow-hidden hover:bg-gray-50 transition-colors ${
            isToday ? "bg-blue-50 border-blue-300" : ""
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</div>
          <div className="space-y-1">
            {courses.slice(0, 2).map((course, index) => (
              <Dialog key={course.id}>
                <DialogTrigger asChild>
                  <div
                    className={`${course.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="font-medium truncate">{course.title}</div>
                    <div className="flex items-center text-xs opacity-90">
                      {course.type === "virtual" ? (
                        <Video className="w-3 h-3 mr-1" />
                      ) : (
                        <MapPin className="w-3 h-3 mr-1" />
                      )}
                      <span className="truncate">{course.venue}</span>
                    </div>
                  </div>
                </DialogTrigger>
              </Dialog>
            ))}
            {courses.length > 2 && <div className="text-xs text-gray-500 font-medium">+{courses.length - 2} more</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  const CourseDetailsModal = ({ course }: { course: any }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">{course.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge className={`${course.color} text-white`}>{course.category}</Badge>
            <div className="flex items-center text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{course.rating}</span>
              <span className="ml-2">• Instructor: {course.instructor}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{course.price}</div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>

        {/* Course Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">
                  {new Date(course.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-500">{course.time}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-gray-500">{course.duration}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              {course.type === "virtual" ? (
                <Video className="w-5 h-5 mr-3 text-gray-400" />
              ) : (
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
              )}
              <div>
                <div className="font-medium">{course.type === "virtual" ? "Virtual Training" : "Venue"}</div>
                <div className="text-sm text-gray-500">{course.venue}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Users className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Available Seats</div>
                <div className="text-sm text-gray-500">
                  {course.seats} of {course.maxSeats} seats remaining
                </div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <User className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Lead Instructor</div>
                <div className="text-sm text-gray-500">{course.instructor}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <BookOpen className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Course Type</div>
                <div className="text-sm text-gray-500 capitalize">{course.type.replace("-", " ")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Course Description</h3>
          <p className="text-gray-600 leading-relaxed">{course.description}</p>
        </div>

        {/* Availability Indicator */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Seat Availability</span>
            <span className="text-sm text-gray-600">
              {course.seats}/{course.maxSeats} available
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${course.seats > 10 ? "bg-green-500" : course.seats > 5 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${(course.seats / course.maxSeats) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            onClick={() => handleBookNow(course)}
          >
            Book Now - {course.price}
          </Button>
          <Button variant="outline" className="px-6">
            Add to Wishlist
          </Button>
          <Button variant="outline" className="px-6">
            Share Course
          </Button>
        </div>
      </div>
    </DialogContent>
  )

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Course Schedule</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our comprehensive training calendar and book your preferred dates and venues.
          </p>
        </div>

        {/* Calendar Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="p-2">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="p-2">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="project">Project Management</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className="px-4"
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className="px-4"
                  >
                    Week
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Marketing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Project Mgmt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Finance</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Virtual</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm">In-Person</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {/* Day Headers */}
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="bg-gray-100 p-3 text-center font-semibold text-gray-700 border-b border-gray-200"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Courses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Courses This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseEvents.slice(0, 6).map((course) => (
                <Dialog key={course.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={`${course.color} text-white`}>{course.category}</Badge>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{course.price}</div>
                            <div className="text-xs text-gray-500">{course.seats} seats left</div>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(course.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            {course.type === "virtual" ? (
                              <Video className="w-4 h-4 mr-2" />
                            ) : (
                              <MapPin className="w-4 h-4 mr-2" />
                            )}
                            {course.venue}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                            {course.rating} • {course.instructor}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <CourseDetailsModal course={course} />
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Details Modal */}
        {selectedCourse && (
          <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
            <CourseDetailsModal course={selectedCourse} />
          </Dialog>
        )}

        {/* Booking Wizard */}
        {bookingCourse && (
          <BookingWizard
            course={bookingCourse}
            isOpen={isBookingOpen}
            onClose={() => {
              setIsBookingOpen(false)
              setBookingCourse(null)
            }}
          />
        )}
      </div>
    </section>
  )
}
