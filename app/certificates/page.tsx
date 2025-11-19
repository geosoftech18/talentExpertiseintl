'use client'

import { Award, CheckCircle2, GraduationCap, Shield, FileText, Star, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const certificates = [
  {
    title: 'CPD Certified Training Courses',
    description: 'Continuous Professional Development certified courses recognized globally',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    benefits: [
      'Globally recognized certification',
      'CPD points awarded',
      'Industry-standard training',
      'Professional development credits',
    ],
  },
  {
    title: 'ILM Recognised Training Courses',
    description: 'Institute of Leadership & Management recognized programs',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefits: [
      'ILM certification upon completion',
      'Leadership skills development',
      'Management competency enhancement',
      'Internationally accredited',
    ],
  },
  {
    title: 'PMI Registered Training Courses',
    description: 'Project Management Institute registered courses for PMP certification',
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    benefits: [
      'PMI PDUs awarded',
      'PMP exam preparation',
      'Project management expertise',
      'Global PMI recognition',
    ],
  },
  {
    title: 'HRCI Pre-approved Training Courses',
    description: 'Human Resource Certification Institute pre-approved programs',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    benefits: [
      'HRCI recertification credits',
      'HR professional development',
      'Certified HR programs',
      'Industry best practices',
    ],
  },
  {
    title: 'NASBA Approved Training Courses',
    description: 'National Association of State Boards of Accountancy approved courses',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    benefits: [
      'NASBA CPE credits',
      'Accounting professional development',
      'CPA continuing education',
      'Financial expertise enhancement',
    ],
  },
  {
    title: 'ISO Training Courses',
    description: 'International Organization for Standardization training programs',
    icon: Star,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    benefits: [
      'ISO certification knowledge',
      'Quality management systems',
      'International standards compliance',
      'Organizational excellence',
    ],
  },
]

export default function CertificatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
              Professional Certifications
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Globally Recognized Certificates
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Earn internationally recognized certifications from leading professional bodies and enhance your career credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((certificate, index) => {
            const IconComponent = certificate.icon
            return (
              <Card
                key={index}
                className={`border-l-4 ${certificate.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-xl ${certificate.bgColor} mb-4`}>
                    <IconComponent className={`w-8 h-8 ${certificate.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{certificate.title}</h3>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{certificate.description}</p>

                  <div className="space-y-2 mb-6">
                    {certificate.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${certificate.color} mt-0.5 shrink-0`} />
                        <span className="text-sm text-slate-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className={`w-full border-2 ${certificate.borderColor} ${certificate.color} hover:${certificate.bgColor}`}
                  >
                    <Link href="/courses">
                      Browse Courses
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Why Get Certified Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Get Certified?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Certified?</h2>
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

