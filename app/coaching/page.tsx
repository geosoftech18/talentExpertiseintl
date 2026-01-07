'use client'

import { 
  Users, 
  Target, 
  Heart,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  X,
  ArrowRight,
  UserCheck,
  TrendingUp,
  Award,
  Handshake
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

const coachingIsNot = [
  {
    title: 'Advising',
    icon: MessageCircle,
    description: 'Coaching is not about giving advice or telling someone what to do.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Telling',
    icon: X,
    description: 'Coaching does not involve telling the coachee what they should do.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Counselling',
    icon: Heart,
    description: 'Coaching is not therapy or counselling focused on past issues.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Teaching',
    icon: Users,
    description: 'Coaching is not about teaching or imparting knowledge directly.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Training',
    icon: Target,
    description: 'Coaching differs from structured training programs.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Therapy',
    icon: Heart,
    description: 'Coaching is not therapeutic intervention for mental health.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Mentoring',
    icon: UserCheck,
    description: 'Coaching is distinct from mentoring relationships.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
]

const coachingBenefits = [
  {
    title: 'Self-Discovery',
    description: 'Embark on a journey of self-discovery and personal growth',
    icon: Lightbulb,
  },
  {
    title: 'Structured Conversation',
    description: 'Engage in meaningful, structured conversations that lead to insights',
    icon: MessageCircle,
  },
  {
    title: 'Constructive Questioning',
    description: 'Benefit from powerful questioning techniques that unlock solutions',
    icon: Target,
  },
  {
    title: 'Active Listening',
    description: 'Experience the power of being truly heard and understood',
    icon: Heart,
  },
]

const coachQualities = [
  {
    title: 'Highly Qualified',
    description: 'Our coaches are highly qualified professionals with extensive experience',
    icon: Award,
  },
  {
    title: 'Emotional Intelligence',
    description: 'Possess high emotional intelligence to connect and understand deeply',
    icon: Heart,
  },
  {
    title: 'Professional Competence',
    description: 'Demonstrated professional competence in the coaching arena',
    icon: UserCheck,
  },
  {
    title: 'Trust & Respect',
    description: 'Build relationships based on trust and mutual respect',
    icon: Handshake,
  },
]

export default function CoachingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
                Professional Services
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Professional Coaching Services
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                Professional Coaching provides leaders with a powerful dynamic unstructured process of conversation 
                that helps them to move from their current position to a future desired state.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/contact">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/10">
                  <Link href="#what-is-coaching">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=90"
                alt="Professional Coaching"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* What is Coaching Section */}
      <section id="what-is-coaching" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&q=90"
                alt="Coaching Conversation"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                Understanding Coaching
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                What is Professional Coaching?
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Professional Coaching provides leaders with a powerful dynamic unstructured process of conversation 
                that helps them to move from their current position to a future desired state. Our team of highly 
                qualified business coaches have gained an excellent reputation for helping top global leaders to improve 
                their personal and organizational efficiency.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                We're the leading training consultants and all our coaches are highly qualified and capable individuals 
                who possess a high degree of emotional intelligence. It is this attribute which coupled with their 
                professional competence in the coaching arena that provides our coaching clients with the opportunity 
                to attain even greater success.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                A successful coaching relationship requires from the outset a good fit with the coach and client. This 
                is all about ensuring that the appropriate level of trust and mutual respect can be nurtured. We will 
                spend time with you working to understand your coaching requirements and then propose a selection of 
                appropriate coaches who will be capable and able to support you in your coaching journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching Is Not Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-red-100 text-red-700 border-red-200 mb-4">
              Understanding What Coaching Is Not
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Coaching Is Not...
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              It is important to understand what coaching is and what it is not. These are all noble acts and are often 
              successful methods for dealing with difficult and tricky situations, decisions and challenges. However, 
              coaching is none of the above.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachingIsNot.map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="border-2 border-slate-200 hover:border-red-300 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* What Coaching Is Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
                The Coaching Approach
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                What Coaching Is
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                In simple terms coaching can be described as the opportunity to invite the coachee on a voyage of 
                self-discovery, where the coach does not tell sell or teach the coachee anything but simply guides 
                the coachee through structured conversation, using constructive questioning and listening, thereby 
                helping the coachee to come to a well thought out and appropriate response to whatever the situation 
                or challenges they are dealing with.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {coachingBenefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800&fit=crop&q=90"
                alt="Coaching Process"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Coaches Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Our Coaches
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our team of highly qualified business coaches have gained an excellent reputation for helping top global 
              leaders to improve their personal and organizational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachQualities.map((quality, index) => {
              const Icon = quality.icon
              return (
                <Card key={index} className="border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {quality.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {quality.description}
                    </p>
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
          <UserCheck className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Coaching Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We will spend time with you working to understand your coaching requirements and then propose a selection 
            of appropriate coaches who will be capable and able to support you in your coaching journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-[#0A3049] hover:bg-blue-50">
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/consulting">
                View Consultancy Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

