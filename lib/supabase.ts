// Type definitions for Supabase database tables

export interface Course {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description?: string | null
  duration: string
  category: string
  price: number
  image_url?: string | null
  course_code?: string | null
}

export interface CourseSchedule {
  id: string
  course_id: string
  start_date: string
  end_date?: string | null
  venue?: string | null
  city?: string | null
  country?: string | null
  price?: number | null
  fees?: number | null
  seats_available?: number | null
  status?: string | null
}

export interface CourseSection {
  id: string
  course_id: string
  section_type: string
  content: string
}

export interface CourseOutline {
  id: string
  course_id: string
  day_number: number
  day_title: string
  topics: string[]
}

export interface CourseBenefit {
  id: string
  course_id: string
  benefit_type: string
  description: string
}

export interface CourseFAQ {
  id: string
  course_id: string
  question: string
  answer: string
}

