'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface RelatedCoursesCarouselProps {
  courses: RelatedCourse[]
}

export function RelatedCoursesCarousel({ courses }: RelatedCoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3

  const maxIndex = Math.max(0, courses.length - itemsPerPage)

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const visibleCourses = courses.slice(currentIndex, currentIndex + itemsPerPage)

  if (courses.length === 0) return null

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Related Courses</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            disabled={currentIndex === 0}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-2xl transition-all duration-500 group relative"
          >
            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              {course.image_url ? (
                <Image
                  src={course.image_url}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-slate-300">
                    {course.title.charAt(0)}
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-slate-900 hover:bg-white shadow-md">
                  {course.category}
                </Badge>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 p-6">
                {/* <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white/90 text-sm font-medium mb-2">Starting from</p>
                  <p className="text-white text-4xl font-bold">
                    ${Number(course.price).toLocaleString()}
                  </p>
                </div> */}
                {/* CTA moved to CardContent */}
              </div>
            </div>

            <CardContent className="relative pt-6 pb-20 overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
               <div className="flex items-center gap-2">
               <p className=" text-orange-600 font-bold">
                    ${Number(course.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                {course.title}
              </h3>

              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {course.description || 'Explore this comprehensive training course designed for professionals.'}
              </p>

              <div className="absolute left-6 right-6 bottom-6 transform translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-500">
                <Link href={`/courses/${course.slug}`} className="w-full block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xl text-lg py-6">
                    View Course
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(courses.length / itemsPerPage) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * itemsPerPage)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / itemsPerPage) === idx
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
