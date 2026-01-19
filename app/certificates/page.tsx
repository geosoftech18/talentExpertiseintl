'use client'

import { useState, useEffect } from 'react'
import { Award, GraduationCap, Shield, FileText, Star, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface Certificate {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

// Color and icon themes for certificates (cycling through)
const colorThemes = [
  { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: Award },
  { color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: GraduationCap },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: FileText },
  { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: Users },
  { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: Shield },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', icon: Star },
]

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/certificates')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch certificates')
        }

        setCertificates(result.data || [])
      } catch (err) {
        console.error('Error fetching certificates:', err)
        setError(err instanceof Error ? err.message : 'Failed to load certificates')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const getTheme = (index: number) => {
    return colorThemes[index % colorThemes.length]
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-white border-blue-400/30 mb-6">
              Professional Certifications
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Globally Recognized Certificates
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Earn internationally recognized certifications from leading professional bodies and enhance your career credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Loading certificates...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg text-slate-700 mb-2">Failed to load certificates</p>
            <p className="text-sm text-slate-500">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Award className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-lg text-slate-700">No certificates available at the moment</p>
            <p className="text-sm text-slate-500 mt-2">Please check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {certificates.map((certificate, index) => {
              const theme = getTheme(index)
              const IconComponent = theme.icon
              return (
                <Link
                  key={certificate.id}
                  href={`/courses?certificate=${encodeURIComponent(certificate.id)}`}
                  className="flex gap-6 items-start p-6 rounded-lg border border-slate-200 bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                >
                  {/* Logo/Image Section */}
                  <div className="flex-shrink-0">
                    {certificate.imageUrl ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                        <Image
                          src={certificate.imageUrl}
                          alt={certificate.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-24 h-24 rounded-full ${theme.bgColor} border-2 ${theme.borderColor} flex items-center justify-center group-hover:border-blue-300 transition-colors`}>
                        <IconComponent className={`w-12 h-12 ${theme.color}`} />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {certificate.name}
                    </h3>
                    {certificate.description && (
                      <p className="text-slate-600 text-lg leading-relaxed">{certificate.description}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Why Get Certified Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Why Get Certified?</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Professional certifications validate your expertise and open doors to new opportunities
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Career Advancement</h3>
                <p className="text-slate-600">
                  Stand out in the job market with recognized certifications that demonstrate your commitment to professional growth.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Industry Recognition</h3>
                <p className="text-slate-600">
                  Gain recognition from leading professional bodies and join a network of certified professionals worldwide.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="p-4 bg-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Higher Earnings</h3>
                <p className="text-slate-600">
                  Certified professionals typically earn higher salaries and have access to better career opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Get Certified?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse our certified training courses and take the next step in your professional journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-transparent hover:bg-white/10 font-semibold px-8"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

