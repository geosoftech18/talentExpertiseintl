'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  BookOpen, 
  Award, 
  Brain, 
  MapPin, 
  Heart, 
  GraduationCap, 
  Monitor, 
  Star, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

const reasons = [
  { id: 1, title: 'Client Focus', icon: Heart, angle: 0 },
  { id: 2, title: '500 + Training Programs', icon: BookOpen, angle: 36 },
  { id: 3, title: 'Great People', icon: Users, angle: 72 },
  { id: 4, title: 'Industry Intelligence', icon: Brain, angle: 108 },
  { id: 5, title: 'Fantastic Global Venues', icon: MapPin, angle: 144 },
  { id: 6, title: 'True to Our Values', icon: Award, angle: 180 },
  { id: 7, title: 'Certified Programs', icon: GraduationCap, angle: 216 },
  { id: 8, title: 'On-line Programs', icon: Monitor, angle: 252 },
  { id: 9, title: 'Outstanding Client Satisfaction', icon: Star, angle: 288 },
  { id: 10, title: 'Responsive to Your Needs', icon: Zap, angle: 324 },
]

export default function WhyChooseTeiPage() {
  const [hoveredReason, setHoveredReason] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Slow continuous rotation animation
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.2) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const getPosition = (angle: number, radius: number) => {
    const rad = ((angle + rotation) * Math.PI) / 180
    const x = Math.cos(rad) * radius
    const y = Math.sin(rad) * radius
    return { x, y }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
              Why Choose TEI
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              10 Reasons to Choose TEI
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Since our formation, back in 2013, we have built a strong and positive reputation as a trusted service provider of learning & development solutions to a fantastically diverse global customer base.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              We take immense pride in the quality of our client relationships and the success of these relationships is built on our <strong className="text-[#0A3049]">100% commitment to delivering on our promises</strong>. We also enjoy what we do, and this satisfaction radiates from all our team members through all our client interactions.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Supported by an exceptional administration function in our Dubai HQ, our trainers, facilitators, coaches and training consultants are unique individuals who all bring something very special to the business. We encourage our people to be themselves and demonstrate their real passion and commitment for their subject matter.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Reasons Circle Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Our Strengths
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Discover What Makes Us Different
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Hover over or click on each reason to learn more about what sets TEI apart
            </p>
          </div>

          {/* Desktop: Circular Layout */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:min-h-[900px] lg:py-20">
            <div 
              ref={containerRef}
              className="relative w-[800px] h-[800px] mx-auto"
            >
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-[#0A3049] to-blue-700 rounded-full flex items-center justify-center shadow-2xl z-10 border-4 border-white">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">10 Reasons</h3>
                  <p className="text-sm text-blue-200">to Choose TEI</p>
                </div>
              </div>

              {/* Connection Lines */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox="0 0 800 800"
                preserveAspectRatio="xMidYMid meet"
              >
                {reasons.map((reason) => {
                  const centerX = 400
                  const centerY = 400
                  const radius = 280
                  const pos = getPosition(reason.angle, radius)
                  return (
                    <line
                      key={reason.id}
                      x1={centerX}
                      y1={centerY}
                      x2={centerX + pos.x}
                      y2={centerY + pos.y}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-300 opacity-30"
                    />
                  )
                })}
              </svg>

              {/* Reason Circles */}
              {reasons.map((reason) => {
                const radius = 280
                const pos = getPosition(reason.angle, radius)
                const isHovered = hoveredReason === reason.id
                const Icon = reason.icon
                const centerX = 400
                const centerY = 400

                return (
                  <div
                    key={reason.id}
                    className="absolute w-32 h-32 transition-all duration-500 ease-out z-20"
                    style={{
                      left: `${centerX + pos.x - 64}px`,
                      top: `${centerY + pos.y - 64}px`,
                    }}
                    onMouseEnter={() => setHoveredReason(reason.id)}
                    onMouseLeave={() => setHoveredReason(null)}
                  >
                    <div
                      className={`
                        w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-800 
                        flex flex-col items-center justify-center text-white shadow-xl
                        transition-all duration-300 cursor-pointer border-4 border-white
                        ${isHovered ? 'scale-125 z-30 shadow-2xl ring-4 ring-blue-300' : 'hover:scale-110 z-20'}
                      `}
                    >
                      <Icon className={`w-8 h-8 mb-2 transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`} />
                      <span className="text-xs font-semibold text-center px-2 leading-tight">
                        {reason.title}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile/Tablet: Grid Layout */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((reason) => {
                const Icon = reason.icon
                return (
                  <Card
                    key={reason.id}
                    className="border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                    onMouseEnter={() => setHoveredReason(reason.id)}
                    onMouseLeave={() => setHoveredReason(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {reason.title}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Reasons Grid Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
              Our Commitment
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What We Deliver
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((reason) => {
              const Icon = reason.icon
              return (
                <Card
                  key={reason.id}
                  className="border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group"
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {reason.title}
                    </h3>
                    <div className="flex items-center text-blue-600">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Core Strength</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Star className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the TEI Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our diverse global customer base and discover why organizations trust TEI for their learning & development needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-[#0A3049] hover:bg-blue-50">
              <Link href="/courses">
                Explore Our Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

