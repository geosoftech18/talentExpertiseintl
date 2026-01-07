'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, ArrowLeft, FileText, Calendar, MapPin, FolderOpen, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

// Mock data - Replace with actual API calls
const getDownloadItems = (slug: string) => {
  switch (slug) {
    case 'tei-profile':
      return [
        {
          id: 1,
          title: 'TEI Company Profile 2024',
          description: 'Comprehensive overview of Talent Expertise International',
          fileUrl: '/downloads/tei-profile-2024.pdf',
          fileSize: '2.5 MB',
          image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 2,
          title: 'TEI Corporate Brochure',
          description: 'Detailed corporate information and service offerings',
          fileUrl: '/downloads/tei-brochure.pdf',
          fileSize: '3.1 MB',
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 3,
          title: 'TEI Annual Report 2023',
          description: 'Annual performance and achievements report',
          fileUrl: '/downloads/tei-annual-report-2023.pdf',
          fileSize: '5.2 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
      ]
    
    case 'training-calendar':
      return [
        {
          id: 1,
          title: 'Training Calendar Q1 2024',
          description: 'First quarter training schedule and courses',
          fileUrl: '/downloads/calendar-q1-2024.pdf',
          fileSize: '1.8 MB',
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 2,
          title: 'Training Calendar Q2 2024',
          description: 'Second quarter training schedule and courses',
          fileUrl: '/downloads/calendar-q2-2024.pdf',
          fileSize: '1.9 MB',
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 3,
          title: 'Training Calendar Q3 2024',
          description: 'Third quarter training schedule and courses',
          fileUrl: '/downloads/calendar-q3-2024.pdf',
          fileSize: '2.0 MB',
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 4,
          title: 'Training Calendar Q4 2024',
          description: 'Fourth quarter training schedule and courses',
          fileUrl: '/downloads/calendar-q4-2024.pdf',
          fileSize: '2.1 MB',
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=90',
        },
      ]
    
    case 'by-categories':
      return [
        {
          id: 1,
          title: 'Leadership & Management',
          description: 'Download course materials for leadership and management programs',
          fileUrl: '/downloads/category-leadership.pdf',
          fileSize: '4.2 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 2,
          title: 'Finance & Accounting',
          description: 'Access finance and accounting training resources',
          fileUrl: '/downloads/category-finance.pdf',
          fileSize: '3.8 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 3,
          title: 'Human Resources',
          description: 'HR training materials and course information',
          fileUrl: '/downloads/category-hr.pdf',
          fileSize: '3.5 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 4,
          title: 'Project Management',
          description: 'Project management course resources and materials',
          fileUrl: '/downloads/category-pm.pdf',
          fileSize: '4.5 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 5,
          title: 'IT & Technology',
          description: 'IT and technology training course materials',
          fileUrl: '/downloads/category-it.pdf',
          fileSize: '3.9 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 6,
          title: 'Sales & Marketing',
          description: 'Sales and marketing training resources',
          fileUrl: '/downloads/category-sales.pdf',
          fileSize: '4.1 MB',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=90',
        },
      ]
    
    case 'by-venue':
      return [
        {
          id: 1,
          title: 'Dubai, UAE',
          description: 'Download course information for Dubai training venue',
          fileUrl: '/downloads/venue-dubai.pdf',
          fileSize: '2.8 MB',
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 2,
          title: 'Abuja, Nigeria',
          description: 'Access course materials for Abuja training venue',
          fileUrl: '/downloads/venue-abuja.pdf',
          fileSize: '2.6 MB',
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 3,
          title: 'London, UK',
          description: 'Download course information for London training venue',
          fileUrl: '/downloads/venue-london.pdf',
          fileSize: '2.9 MB',
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=90',
        },
        {
          id: 4,
          title: 'Kuala Lumpur, Malaysia',
          description: 'Access course materials for Kuala Lumpur training venue',
          fileUrl: '/downloads/venue-kl.pdf',
          fileSize: '2.7 MB',
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=90',
        },
      ]
    
    default:
      return []
  }
}

const getCategoryInfo = (slug: string) => {
  switch (slug) {
    case 'tei-profile':
      return {
        title: 'TEI Profile',
        description: 'Download our company profile, brochures, and corporate information',
        icon: FileText,
        color: 'from-[#0A3049] to-[#0A3049]',
      }
    case 'training-calendar':
      return {
        title: 'TEI Training Calendar',
        description: 'Access our comprehensive training calendars organized by quarters',
        icon: Calendar,
        color: 'from-[#0A3049] to-[#0A3049]',
      }
    case 'by-categories':
      return {
        title: 'Download by Categories',
        description: 'Browse and download course materials organized by training categories',
        icon: FolderOpen,
        color: 'from-[#0A3049] to-[#0A3049]',
      }
    case 'by-venue':
      return {
        title: 'Download by Course Venue',
        description: 'Find and download course information based on training venue locations',
        icon: MapPin,
        color: 'from-[#0A3049] to-[#0A3049]',
      }
    default:
      return {
        title: 'Downloads',
        description: 'Download resources and materials',
        icon: Download,
        color: 'from-slate-600 to-slate-800',
      }
  }
}

function DownloadCategoryContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const downloadItems = getDownloadItems(slug)
      setItems(downloadItems)
      setLoading(false)
    }, 500)
  }, [slug])

  const categoryInfo = getCategoryInfo(slug)
  const Icon = categoryInfo.icon

  const handleDownload = (fileUrl: string, title: string) => {
    // In production, this would trigger actual file download
    // For now, we'll just log it
    console.log('Downloading:', fileUrl, title)
    // You can implement actual download logic here
    // window.open(fileUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-r ${categoryInfo.color} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/downloads')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Downloads
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                {categoryInfo.title}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {categoryInfo.title}
              </h1>
              <p className="text-blue-100 text-lg">
                {categoryInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Items Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : items.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="group border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative h-[200px] bg-slate-200 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.fileSize}</span>
                      <Button
                        onClick={() => handleDownload(item.fileUrl, item.title)}
                        className={`bg-gradient-to-r ${categoryInfo.color} hover:opacity-90 text-white`}
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No downloads available</h3>
              <p className="text-slate-600 mb-6">There are no downloads available in this category yet.</p>
              <Button asChild>
                <Link href="/downloads">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Downloads
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function DownloadCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DownloadCategoryContent />
    </Suspense>
  )
}

