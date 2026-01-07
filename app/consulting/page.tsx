'use client'

import { 
  Briefcase, 
  Users, 
  Target, 
  TrendingUp, 
  UserCheck, 
  FileText, 
  CheckCircle2,
  BarChart3,
  Lightbulb,
  Handshake,
  Award,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

const services = [
  {
    icon: Users,
    title: 'Cultural Identity Definition',
    description: 'Help organizations define and strengthen their unique cultural identity to create a cohesive and purpose-driven workplace.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'Training Needs & Skills Gap Analysis',
    description: 'Comprehensive analysis to identify skill gaps and training requirements that align with your strategic objectives.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: UserCheck,
    title: 'Senior Level Recruitment & Assessment',
    description: 'Expert recruitment and assessment services to identify and onboard top-tier executive talent.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Board Level Mentoring',
    description: 'Facilitate strategic mentoring programs for senior executives and board members.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Briefcase,
    title: 'Non-Executive Directors Support',
    description: 'Comprehensive support services for non-executive directors to enhance board effectiveness.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
]

const behavioralFramework = [
  {
    title: 'Leadership',
    description: 'Assessing the ability to inspire, guide, and drive organizational success through effective leadership practices.',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Teamwork & Working with Others',
    description: 'Evaluating collaboration skills, interpersonal effectiveness, and the capacity to work harmoniously in team environments.',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Business Judgement',
    description: 'Analyzing decision-making capabilities, strategic thinking, and the ability to make sound business decisions.',
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Drive, Commitment & Personal Development',
    description: 'Measuring motivation levels, dedication to goals, and commitment to continuous personal and professional growth.',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Client Focus',
    description: 'Evaluating customer-centricity, service orientation, and the ability to build and maintain strong client relationships.',
    icon: Handshake,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
]

const reportBenefits = [
  {
    title: 'HR Succession Planning',
    description: 'Identify and develop future leaders within your organization',
    icon: Target,
  },
  {
    title: 'Performance Management',
    description: 'Gain insights to enhance individual and team performance',
    icon: BarChart3,
  },
  {
    title: 'Executive Onboarding',
    description: 'Provide new C-suite executives with impartial team insights',
    icon: UserCheck,
  },
  {
    title: 'Objective Assessment',
    description: 'Third-party impartial evaluation of your human resources',
    icon: CheckCircle2,
  },
]

export default function ConsultingPage() {
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
                Professional Consultancy Services
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                We offer a comprehensive range of consultancy services designed to create a strong, 
                commercially focused business environment that is fit for the future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/contact">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/10">
                  <Link href="/services">
                    Our Services
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=90"
                alt="Professional Consulting"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Human Resource Capability Report Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&q=90"
                alt="Human Resource Capability Report"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
                Core Service
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Human Resource Capability Report
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our comprehensive consultancy service provides clients with a clear and impartial 
                analysis of the strengths and potential limitations of their key human resources.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                This tried and tested service focuses on recording a series of behavioural observations 
                in a dispassionate and objective manner. These observations determine the extent to which 
                individuals are aligned with your company's values and vision.
              </p>
              <div className="space-y-4">
                {reportBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <benefit.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Behavioral Framework Section - Image Right */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
                Assessment Framework
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Behavioral Definition Framework
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Underpinning our report is a behavioral definition framework which is applied as a template 
                for benchmarking purposes. This framework consists of five specific behaviors each having 
                a detailed and clear definition attributed to it.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Contained within each behavioral definition is a supporting criteria statement highlighting 
                corresponding behaviors, positive indicators, and negative indicators.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Framework Components
                    </h4>
                    <ul className="space-y-2 text-slate-700 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Leadership</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Teamwork & Working with Others</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Business Judgement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Drive, Commitment & Personal Development</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Client Focus</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=90"
                alt="Behavioral Framework"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Observation & Measurement Section - Image Left */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&q=90"
                alt="Observation & Measurement"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                Our Methodology
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Objective Observation & Measurement
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Through a variety of standard observation practices and objective measurement processes, 
                we produce a detailed and personalized Human Resource Capability Report which is unique 
                to each individual.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our approach ensures that behavioral observations are recorded in a dispassionate and 
                objective manner, providing you with clear insights into how individuals align with 
                your company's values and vision.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-700">
                    Standard observation practices for consistent evaluation
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-700">
                    Objective measurement processes for unbiased assessment
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-700">
                    Personalized reports tailored to each individual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Applications Section - Image Right */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">
                Real-World Impact
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Practical Applications & Benefits
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                This report has many practical applications and benefits in terms of HR succession planning, 
                performance management, and from newly appointed 'C' suite level executives, to be given a 
                third-party impartial insight into their inherited teams.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      HR Succession Planning
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Identify and develop future leaders within your organization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Performance Management
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Gain insights to enhance individual and team performance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Executive Onboarding
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Provide new C-suite executives with impartial team insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop&q=90"
                alt="Practical Applications"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

