'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Calendar, Clock, MapPin, Users, GraduationCap,
  TrendingUp, Target, BookOpen, Award, Download,
  ChevronRight, CheckCircle2, ArrowRight, Edit,
  Mail, Building2, Video, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CourseRegistrationForm } from '@/components/course-registration-form'
import { CourseEnquiryForm } from '@/components/course-enquiry-form'
import { InHouseCourseForm } from '@/components/in-house-course-form'
import { OnlineSessionForm } from '@/components/online-session-form'
import { DownloadBrochureForm } from '@/components/download-brochure-form'
import { RelatedCoursesCarousel } from '@/components/related-courses-carousel'
import { parseContent } from '@/lib/utils/content-parser'

interface Course {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  shortDescription?: string | null
  duration: string
  category: string
  price: number
  image_url?: string | null
}

interface CourseSchedule {
  id: string
  course_id: string
  start_date: string
  end_date?: string | null
  venue: string
  price: number
  seats_available: number
  status: string
}

interface CourseSection {
  id: string
  course_id: string
  section_type: string
  content: string
}

interface CourseOutline {
  id: string
  course_id: string
  day_number: number
  day_title: string
  topics: string[]
}

interface CourseBenefit {
  id: string
  course_id: string
  benefit_type: string
  description: string
}

interface CourseFAQ {
  id: string
  course_id: string
  question: string
  answer: string
}

interface RelatedCourse {
  id: string
  slug: string
  title: string
  duration: string
  description: string | null
  category: string
  price: number
  image_url: string | null
}

interface CourseDetailClientProps {
  course: Course
  schedules: CourseSchedule[]
  sections: CourseSection[]
  outline: CourseOutline[]
  benefits: CourseBenefit[]
  faqs: CourseFAQ[]
  relatedCourses: RelatedCourse[]
}

export default function CourseDetailClient({
  course,
  schedules,
  sections,
  outline,
  benefits,
  faqs,
  relatedCourses
}: CourseDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [showInHouse, setShowInHouse] = useState(false)
  const [showOnlineSession, setShowOnlineSession] = useState(false)
  const [showDownloadBrochure, setShowDownloadBrochure] = useState(false)
  const [showStickyTabs, setShowStickyTabs] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(80)

  const overviewRef = useRef<HTMLDivElement>(null)
  const curriculumRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const scheduleRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const certificatesRef = useRef<HTMLDivElement>(null)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const [leftColumnWidth, setLeftColumnWidth] = useState(0)
  const [leftColumnLeft, setLeftColumnLeft] = useState(0)

  const getSectionByType = (type: string) => {
    return sections.find(s => s.section_type === type)
  }

  const getBenefitsByType = (type: string) => {
    return benefits.filter(b => b.benefit_type === type)
  }

  const scrollToSection = (sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      schedule: scheduleRef,
      overview: overviewRef,
      curriculum: curriculumRef,
      benefits: benefitsRef,
      faq: faqRef
    }

    const ref = refs[sectionId]
    if (ref?.current) {
      const offset = headerHeight + 100
      const elementPosition = ref.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setActiveTab(sectionId)
  }

  useEffect(() => {
    // Calculate header height dynamically
    const calculateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }

    // Calculate left column position and width
    const calculateLeftColumnPosition = () => {
      if (leftColumnRef.current) {
        const rect = leftColumnRef.current.getBoundingClientRect()
        setLeftColumnLeft(rect.left)
        setLeftColumnWidth(rect.width)
      }
    }

    calculateHeaderHeight()
    calculateLeftColumnPosition()
    
    window.addEventListener('resize', () => {
      calculateHeaderHeight()
      calculateLeftColumnPosition()
    })

    const handleScroll = () => {
      // Check if certification section is in view - if so, hide sticky tabs
      if (certificatesRef.current) {
        const certRect = certificatesRef.current.getBoundingClientRect()
        const certTop = certRect.top
        
        // Hide tabs when certification section reaches near the header
        if (certTop <= (headerHeight + 150)) {
          setShowStickyTabs(false)
          return
        }
      }

      if (tabsRef.current) {
        const tabsPosition = tabsRef.current.getBoundingClientRect().top
        setShowStickyTabs(tabsPosition < headerHeight)
      }

      // Recalculate position on scroll (in case layout changes)
      calculateLeftColumnPosition()

      const refs = [
        { id: 'schedule', ref: scheduleRef },
        { id: 'overview', ref: overviewRef },
        { id: 'benefits', ref: benefitsRef },
        { id: 'curriculum', ref: curriculumRef },
        { id: 'faq', ref: faqRef }
      ]

      for (const { id, ref } of refs) {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          if (rect.top <= (headerHeight + 100) && rect.bottom >= (headerHeight + 100)) {
            setActiveTab(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculateHeaderHeight)
    }
  }, [headerHeight])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {showRegistration && (
        <CourseRegistrationForm
          course={course}
          schedules={schedules}
          selectedScheduleId={selectedScheduleId}
          onClose={() => {
            setShowRegistration(false)
            setSelectedScheduleId(null)
          }}
        />
      )}

      {showEnquiry && (
        <CourseEnquiryForm
          course={course}
          onClose={() => setShowEnquiry(false)}
        />
      )}

      {showInHouse && (
        <InHouseCourseForm
          course={course}
          onClose={() => setShowInHouse(false)}
        />
      )}

      {showOnlineSession && (
        <OnlineSessionForm
          course={course}
          onClose={() => setShowOnlineSession(false)}
        />
      )}

      {showDownloadBrochure && (
        <DownloadBrochureForm
          course={course}
          onClose={() => setShowDownloadBrochure(false)}
        />
      )}

      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
              {course.duration}
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              {course.category}
            </Badge>
          </div>

      <h1 className="text-2xl md:text-4xl font-bold mb-6 leading-tight animate-slide-up">
            {course.title}
          </h1>

          {course.shortDescription && (
            <p className="text-xl text-slate-300 mb-8 max-w-3xl animate-slide-up animation-delay-200">
              {course.shortDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-6 mb-8 animate-slide-up animation-delay-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">Expert-Led Training</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">CPE Credits Available</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-400">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-lg shadow-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/60 hover:scale-105"
              onClick={() => setShowRegistration(true)}
            >
              Register Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-blue-600 hover:text-white hover:bg-white/10 font-semibold px-8"
              onClick={() => setShowEnquiry(true)}
            >
              Enquire About Course
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-blue-600 hover:text-white hover:bg-white/10 font-semibold px-8"
              onClick={() => setShowDownloadBrochure(true)}
            >
              <Download className="mr-2 w-5 h-5" />
              Download Brochure
            </Button>
          </div>
        </div>
      </div>

      {showStickyTabs && leftColumnWidth > 0 && (
        <div 
          className="fixed bg-white shadow-md z-40 animate-slide-down border-b border-slate-200"
          style={{ 
            top: `${headerHeight}px`,
            left: `${leftColumnLeft}px`,
            width: `${leftColumnWidth}px`,
          }}
        >
          <div className="px-2 sm:px-4 md:px-6 py-2 h-full">
            {/* Mobile: Horizontal scrollable tabs */}
            <div className="md:hidden overflow-x-auto scrollbar-hide -mx-2 px-2">
              <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-md min-w-max">
                <button
                  onClick={() => scrollToSection('schedule')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'schedule'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => scrollToSection('overview')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'benefits'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection('curriculum')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'curriculum'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Outline
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'faq'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  FAQ
                </button>
              </div>
            </div>
            {/* Desktop: Grid layout */}
            <div className="hidden md:grid w-full grid-cols-5 gap-1.5 bg-slate-100 p-0.5 rounded-md">
              <button
                onClick={() => scrollToSection('schedule')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => scrollToSection('overview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'benefits'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection('curriculum')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'curriculum'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outline
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'faq'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div ref={leftColumnRef} className="lg:col-span-2 space-y-8">
            <div ref={tabsRef} className="mb-8">
              {/* Mobile: Horizontal scrollable tabs */}
              <div className="md:hidden overflow-x-auto scrollbar-hide -mx-6 px-6">
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg min-w-max">
                  <button
                    onClick={() => scrollToSection('schedule')}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => scrollToSection('overview')}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => scrollToSection('benefits')}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'benefits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Benefits
                  </button>
                  <button
                    onClick={() => scrollToSection('curriculum')}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'curriculum' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Outline
                  </button>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'faq' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FAQ
                  </button>
                </div>
              </div>
              {/* Desktop: Grid layout */}
              <div className="hidden md:grid w-full grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => scrollToSection('schedule')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => scrollToSection('overview')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'benefits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection('curriculum')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'curriculum' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Outline
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'faq' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  FAQ
                </button>
              </div>
            </div>

            {/* Classroom Schedule Section */}
            {schedules.length > 0 && (
              <Card ref={scheduleRef} className="shadow-md border-t-4 border-t-red-600">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Classroom Schedule</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">Date</th>
                          <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900">Venue</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-slate-900">Fees</th>
                          <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {schedules.map((schedule) => {
                          const formatScheduleDate = (dateString: string) => {
                            const date = new Date(dateString)
                            const day = date.getDate()
                            const month = date.toLocaleDateString('en-US', { month: 'short' })
                            const year = date.getFullYear()
                            return { day, month, year }
                          }

                          const startDate = formatScheduleDate(schedule.start_date)
                          const endDate = schedule.end_date 
                            ? formatScheduleDate(schedule.end_date)
                            : startDate
                          
                          const dateDisplay = startDate.year === endDate.year
                            ? `${startDate.day} - ${endDate.day} ${endDate.month} ${endDate.year}`
                            : `${startDate.day} ${startDate.month} ${startDate.year} - ${endDate.day} ${endDate.month} ${endDate.year}`

                          // Format venue (split by comma if exists, otherwise use as is)
                          const venueParts = schedule.venue.split(',').map(part => part.trim())
                          const venueDisplay = venueParts.length > 1
                            ? `${venueParts[0]} - ${venueParts[venueParts.length - 1]}`
                            : schedule.venue

                          const formattedPrice = `$ ${schedule.price.toLocaleString()}`

                          return (
                            <tr 
                              key={schedule.id}
                              className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                              <td className="py-4 px-4 text-slate-900 font-medium">
                                {dateDisplay}
                              </td>
                              <td className="py-4 px-4 text-center text-slate-700">
                                {venueDisplay}
                              </td>
                              <td className="py-4 px-4 text-right text-slate-900 font-medium">
                                {formattedPrice}
                              </td>
                              <td 
                                className="py-4 px-4 text-center"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedScheduleId(schedule.id)
                                  setShowRegistration(true)
                                }}
                              >
                                <ChevronRight className="w-5 h-5 text-red-600 mx-auto group-hover:translate-x-1 transition-transform cursor-pointer" />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6" ref={overviewRef}>
              {getSectionByType('introduction') && (() => {
                const intro = getSectionByType('introduction')
                const parsed = parseContent(intro?.content)
                
                return (
                  <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-3">Introduction</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              {parsed.itemsHtml ? (
                                <ul className="space-y-3">
                                  {parsed.itemsHtml.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span 
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : parsed.items ? (
                                <ul className="space-y-3">
                                  {parsed.items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : parsed.type === 'list' && parsed.items ? (
                            <ul className="space-y-3">
                              {parsed.itemsHtml ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span 
                                      className="text-slate-700"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </li>
                                ))
                              ) : (
                                parsed.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : (
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {getSectionByType('objectives') && (() => {
                const objectives = getSectionByType('objectives')
                const parsed = parseContent(objectives?.content)
                
                return (
                  <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Target className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-3">Course Objectives</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              <div className="space-y-3">
                                {parsed.itemsHtml ? (
                                  parsed.itemsHtml.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <p 
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </div>
                                  ))
                                ) : parsed.items ? (
                                  parsed.items.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-slate-700">{item}</p>
                                    </div>
                                  ))
                                ) : null}
                              </div>
                            </div>
                          ) : parsed.type === 'list' && parsed.items ? (
                            <div className="space-y-3">
                              {parsed.itemsHtml ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <p 
                                      className="text-slate-700"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </div>
                                ))
                              ) : (
                                parsed.items.map((item, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-700">{item}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : (
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {getSectionByType('methodology') && (() => {
                const methodology = getSectionByType('methodology')
                const parsed = parseContent(methodology?.content)
                
                return (
                  <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <GraduationCap className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-3">Training Methodology</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              {parsed.itemsHtml ? (
                                <ul className="space-y-3">
                                  {parsed.itemsHtml.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <span 
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : parsed.items ? (
                                <ul className="space-y-3">
                                  {parsed.items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : parsed.type === 'list' && parsed.items ? (
                            <ul className="space-y-3">
                              {parsed.itemsHtml ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span 
                                      className="text-slate-700"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </li>
                                ))
                              ) : (
                                parsed.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : (
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {getSectionByType('who_should_attend') && (() => {
                const whoShouldAttend = getSectionByType('who_should_attend')
                const parsed = parseContent(whoShouldAttend?.content)
                
                return (
                  <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Users className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-3">Who Should Attend?</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {parsed.itemsHtml ? (
                                  parsed.itemsHtml.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                                      <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                      <p 
                                        className="text-slate-700 text-sm"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </div>
                                  ))
                                ) : parsed.items ? (
                                  parsed.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                                      <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                      <p className="text-slate-700 text-sm">{item}</p>
                                    </div>
                                  ))
                                ) : null}
                              </div>
                            </div>
                          ) : parsed.type === 'list' && parsed.items ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {parsed.itemsHtml ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    <p 
                                      className="text-slate-700 text-sm"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </div>
                                ))
                              ) : (
                                parsed.items.map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    <p className="text-slate-700 text-sm">{item}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : (
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>

            <div className="space-y-6" ref={benefitsRef}>
              {getBenefitsByType('organizational').length > 0 && (() => {
                const orgBenefits = getBenefitsByType('organizational')
                // Combine all organizational benefit descriptions
                const combinedContent = orgBenefits.map(b => b.description).filter(Boolean).join('\n')
                const parsed = parseContent(combinedContent)
                
                // Check if we have any content to display
                const hasContent = 
                  (parsed.type === 'mixed' && (parsed.description || parsed.items?.length || parsed.itemsHtml?.length)) ||
                  (parsed.type === 'list' && (parsed.items?.length || parsed.itemsHtml?.length)) ||
                  (parsed.type === 'html' && parsed.html) ||
                  (parsed.plainText && parsed.plainText.trim())
                
                if (!hasContent) return null
                
                return (
                  <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-4">Organizational Impact</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              {parsed.itemsHtml && parsed.itemsHtml.length > 0 ? (
                                <ul className="space-y-3">
                                  {parsed.itemsHtml.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span 
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : parsed.items && parsed.items.length > 0 ? (
                                <ul className="space-y-3">
                                  {parsed.items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : parsed.type === 'list' && (parsed.items || parsed.itemsHtml) ? (
                            <ul className="space-y-3">
                              {parsed.itemsHtml && parsed.itemsHtml.length > 0 ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span 
                                      className="text-slate-700"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </li>
                                ))
                              ) : parsed.items && parsed.items.length > 0 ? (
                                parsed.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                  </li>
                                ))
                              ) : null}
                            </ul>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : parsed.plainText && parsed.plainText.trim() ? (
                            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText.split('\n').map((paragraph, index) => (
                                paragraph.trim() ? (
                                  <p key={index} className="mb-4 last:mb-0">{paragraph.trim()}</p>
                                ) : null
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {getBenefitsByType('personal').length > 0 && (() => {
                const personalBenefits = getBenefitsByType('personal')
                // Combine all personal benefit descriptions
                const combinedContent = personalBenefits.map(b => b.description).filter(Boolean).join('\n')
                const parsed = parseContent(combinedContent)
                
                // Check if we have any content to display
                const hasContent = 
                  (parsed.type === 'mixed' && (parsed.description || parsed.items?.length || parsed.itemsHtml?.length)) ||
                  (parsed.type === 'list' && (parsed.items?.length || parsed.itemsHtml?.length)) ||
                  (parsed.type === 'html' && parsed.html) ||
                  (parsed.plainText && parsed.plainText.trim())
                
                if (!hasContent) return null
                
                return (
                  <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Award className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <h2 className="text-2xl font-bold mb-4">Personal Impact</h2>
                          {parsed.type === 'mixed' ? (
                            <div className="space-y-4">
                              {/* Description */}
                              {parsed.descriptionHtml ? (
                                <div 
                                  className="text-slate-700 leading-relaxed prose prose-slate max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: parsed.descriptionHtml }}
                                />
                              ) : parsed.description ? (
                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                  {parsed.description}
                                </p>
                              ) : null}
                              {/* Bullet Points */}
                              {parsed.itemsHtml && parsed.itemsHtml.length > 0 ? (
                                <ul className="space-y-3">
                                  {parsed.itemsHtml.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <span 
                                        className="text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : parsed.items && parsed.items.length > 0 ? (
                                <ul className="space-y-3">
                                  {parsed.items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : parsed.type === 'list' && (parsed.items || parsed.itemsHtml) ? (
                            <ul className="space-y-3">
                              {parsed.itemsHtml && parsed.itemsHtml.length > 0 ? (
                                parsed.itemsHtml.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span 
                                      className="text-slate-700"
                                      dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                  </li>
                                ))
                              ) : parsed.items && parsed.items.length > 0 ? (
                                parsed.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                  </li>
                                ))
                              ) : null}
                            </ul>
                          ) : parsed.type === 'html' && parsed.html ? (
                            <div 
                              className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: parsed.html }}
                            />
                          ) : parsed.plainText && parsed.plainText.trim() ? (
                            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {parsed.plainText.split('\n').map((paragraph, index) => (
                                paragraph.trim() ? (
                                  <p key={index} className="mb-4 last:mb-0">{paragraph.trim()}</p>
                                ) : null
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>

            <div className="space-y-6" ref={curriculumRef}>
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Course Outline</h2>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {outline.map((day) => (
                      <AccordionItem
                        key={day.id}
                        value={`day-${day.day_number}`}
                        className="border rounded-lg px-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {day.day_number}
                            </div>
                            <span className="font-semibold text-lg">{day.day_title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          {(() => {
                            const dayContent = (day as any).content || ''
                            const parsed = parseContent(dayContent)
                            
                            if (parsed.type === 'list' && parsed.items && parsed.items.length > 0) {
                              return (
                                <ul className="space-y-3">
                                  {parsed.items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )
                            } else if (parsed.type === 'html' && parsed.html) {
                              return (
                                <div 
                                  className="prose prose-slate max-w-none"
                                  dangerouslySetInnerHTML={{ __html: parsed.html }}
                                />
                              )
                            } else if (day.topics && day.topics.length > 0) {
                              return (
                                <ul className="space-y-3">
                                  {day.topics.map((topic, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-slate-700">{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              )
                            } else if (parsed.plainText) {
                              return (
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                  {parsed.plainText}
                                </p>
                              )
                            } else {
                              return (
                                <p className="text-slate-500 italic">No content available</p>
                              )
                            }
                          })()}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6" ref={faqRef}>
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={faq.id}
                        value={`faq-${index}`}
                        className="border rounded-lg px-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline text-left">
                          <span className="font-semibold">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 text-slate-700">
                          {faq.answer && faq.answer.includes('<') ? (
                            <div 
                              className="prose prose-slate max-w-none"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          ) : (
                            <p>{faq.answer}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 shadow-lg border-2 border-blue-100">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Course Fee</h3>
                  <p className="text-4xl font-bold text-slate-900">
                    ${Number(course.price).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">per participant</p>
                </div>

                <div className="space-y-3 mb-6">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all justify-start"
                    size="lg"
                    onClick={() => setShowRegistration(true)}
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Register for the Course
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-semibold border-2 hover:bg-blue-700 justify-start"
                    size="lg"
                    onClick={() => setShowEnquiry(true)}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Enquire about this Course
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-semibold border-2 hover:bg-blue-700 justify-start"
                    size="lg"
                    onClick={() => setShowInHouse(true)}
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Run this Course In-House
                  </Button>
                 
                 
                </div>

                <div className="space-y-3 pt-6 border-t">
                  <h4 className="font-semibold text-slate-900 mb-3">What's Included</h4>
                  {[
                    'Expert instruction',
                    'Course materials',
                    'Certificate of completion',
                    'CPE credits',
                    'Refreshments & lunch',
                    'Networking opportunities'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded"></div>
                    Related Categories
                  </h3>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between font-semibold border-2 hover:bg-slate-50 text-left group"
                  size="lg"
                >
                  <span className="text-red-600">{course.category}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div ref={certificatesRef} className="max-w-7xl mx-auto px-6 py-12 border-t">
          <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4">
                <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-slate-900">Certificates</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg text-slate-700 leading-relaxed">
                        On successful completion of this training course, <span className="font-semibold text-slate-900">GLOMACS Certificate</span> will be awarded to the delegates.
                      </p>
                    </div>
                    <div className="bg-white/80 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-lg mb-2 text-slate-900">Continuing Professional Education credits (CPE)</h3>
                      <p className="text-slate-700 leading-relaxed">
                        In accordance with the standards of the National Registry of CPE Sponsors, one CPE credit is granted per 50 minutes of attendance.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Endorsed Education Provider</p>
                        <p className="text-xs text-slate-600">NASBA Certified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 bg-slate-50">
          <RelatedCoursesCarousel courses={relatedCourses} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .bg-grid-white\\/\\[0\\.05\\] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  )
}

