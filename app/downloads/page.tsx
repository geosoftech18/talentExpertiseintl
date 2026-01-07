'use client'

import { Download, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

const downloadCategories = [
  {
    slug: 'tei-profile',
    title: 'TEI Profile',
    description: 'Download our company profile and learn more about Talent Expertise International',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&q=90',
    color: 'from-white/10 to-white/10',
  },
  {
    slug: 'training-calendar',
    title: 'TEI Training Calendar',
    description: 'Access our comprehensive training calendar with all upcoming courses and schedules',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=90',
    color: 'from-white/10 to-white/10',
  },
  {
    slug: 'by-categories',
    title: 'Download by Categories',
    description: 'Browse and download course materials organized by training categories',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=90',
    color: 'from-white/10 to-white/10',
  },
  {
    slug: 'by-venue',
    title: 'Download by Course Venue',
    description: 'Find and download course information based on training venue locations',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=90',
    color: 'from-white/10 to-white/10',
  },
]

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
              Resources
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Downloads
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Access our comprehensive collection of training materials, calendars, profiles, and course information 
              organized for your convenience.
            </p>
          </div>
        </div>
      </div>

      {/* Download Categories Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-2">
          {/* <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Download Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Download Category
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Select from the categories below to access relevant documents and resources
            </p>
          </div> */}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {downloadCategories.map((category) => (
              <Card
                key={category.slug}
                className="group border-2 border-slate-400 shadow-2xl hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col"
              >
                <div className="relative h-[200px]  overflow-hidden ">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 px-2"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" /> */}
                </div>
                <CardContent className="p-6 flex flex-col" style={{ minHeight: '140px' }}>
                  <h3 className="text-xl text-center font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <div className="flex-grow"></div>
                  <Button
                    asChild
                    className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white mt-auto`}
                  >
                    <Link href={`/downloads/${category.slug}`}>
                      Click here
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

