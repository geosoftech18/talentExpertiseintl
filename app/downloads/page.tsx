'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface DownloadCategoryCard {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

export default function DownloadsPage() {
  const [categories, setCategories] = useState<DownloadCategoryCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/download-categories')
        const json = await res.json()
        if (json.success) {
          setCategories(json.data || [])
        } else {
          setCategories([])
        }
      } catch (e) {
        console.error('Error loading download categories:', e)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              No download categories available yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="group border-2 border-slate-400 shadow-2xl hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col"
                >
                  <div className="relative h-[200px] overflow-hidden bg-slate-100">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 px-2"
                        unoptimized={
                          category.imageUrl.startsWith('data:') ||
                          category.imageUrl.startsWith('http')
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                        {category.name}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex flex-col" style={{ minHeight: '140px' }}>
                    <h3 className="text-xl text-center font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex-grow" />
                    <Button
                      asChild
                      className="w-full bg-[#0A3049] hover:opacity-90 text-white mt-auto"
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
          )}
        </div>
      </section>
    </div>
  )
}
