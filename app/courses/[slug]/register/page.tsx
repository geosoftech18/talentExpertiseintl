'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CourseRegistrationForm } from '@/components/course-registration-form'
import type { Course, CourseSchedule } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function CourseRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!slug) {
        setError('Course slug is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch course details with schedules
        const response = await fetch(`/api/courses/${slug}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load course details')
        }

        const courseData = result.data.course as Course
        const schedulesData = result.data.schedules as CourseSchedule[]

        setCourse(courseData)
        setSchedules(schedulesData)

        // Get scheduleId from URL params if provided
        const urlParams = new URLSearchParams(window.location.search)
        const scheduleIdParam = urlParams.get('scheduleId')
        if (scheduleIdParam && schedulesData.find(s => s.id === scheduleIdParam)) {
          setSelectedScheduleId(scheduleIdParam)
        } else if (schedulesData.length > 0) {
          // Default to first schedule if none specified
          setSelectedScheduleId(schedulesData[0].id)
        }
      } catch (err) {
        console.error('Error fetching course data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading course registration...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Course</h2>
            <p className="text-red-700 mb-4">{error || 'Course not found'}</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <CourseRegistrationForm
        course={course}
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onClose={() => router.push(`/courses/${slug}`)}
      />
    </div>
  )
}


