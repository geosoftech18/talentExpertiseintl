'use client'

import { Award, Users, Globe, Target, TrendingUp, CheckCircle2, Star, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CompanyIntro } from '@/components/about/company-intro'
import { CEOMessage } from '@/components/about/ceo-message'
import AffiliationsSection from '@/components/home/affiliations-section'

const stats = [
  { label: 'Years of Experience', value: '30+', icon: Award },
  { label: 'Training Courses', value: '500+', icon: TrendingUp },
  { label: 'Participants Trained', value: '1M+', icon: Users },
  { label: 'Countries Served', value: '100+', icon: Globe },
]

const values = [
  {
    title: 'Excellence',
    description: 'Delivering world-class training programs that exceed expectations',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    title: 'Innovation',
    description: 'Embracing cutting-edge methodologies and technologies',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Integrity',
    description: 'Maintaining the highest standards of professionalism and ethics',
    icon: CheckCircle2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Impact',
    description: 'Transforming careers and organizations through meaningful learning',
    icon: Target,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
]

const accreditations = [
  'CPD Certified Training',
  'ILM Recognised',
  'PMI Registered',
  'HRCI Pre-approved',
  'NASBA Approved',
  'ISO Training Courses',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
              About Us
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empowering Professionals Worldwide
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              For over 30 years, TEI Training has been at the forefront of professional development,
              delivering world-class training programs that transform careers and drive organizational success.
            </p>
          </div>
        </div>
      </div>

      <CompanyIntro
        heading="Welcome to Talent Expertise International"
        lead="Exceptional Training, Coaching & Consulting"
        paragraphs={[
          "At TEI, our reputation as an 'exceptional provider' of world class training, coaching and consulting services, continues to grow each year. We offer our services as a seamless, end to end experience, delivered through our global network of more than 100 accredited senior consultants, trainers and coaches. We partner with only the very best conference and banqueting providers in over 36 cities worldwide, ensuring that excellent customer experience is maintained at every stage in our service offering.",
          "Our corporate training program have, over the years, helped and encouraged tens of thousands of individuals to increase their professional competence and advance their career prospects. Our ground-breaking approach to addressing the full life cycle of training and development promotes new ways of assessing real training needs and developing long-lasting and successful solutions.",
          "Our programs are carried out at some of the most exclusive venues in the world, by the most competent, highly qualified and experienced personnel in the world.",
        ]}
        highlights={[
          {
            icon: <Globe className="w-8 h-8" />,
            label: "36+ Cities",
            desc: "Premier conference & banqueting partners",
          },
          {
            icon: <Users className="w-8 h-8" />,
            label: "100+ Experts",
            desc: "Accredited senior consultants, trainers & coaches",
          },
          {
            icon: <Award className="w-8 h-8" />,
            label: "Exceptional Provider",
            desc: "World-class training, coaching & consulting",
          },
          {
            icon: <TrendingUp className="w-8 h-8" />,
            label: "Tens of Thousands",
            desc: "Upskilled & advanced career prospects",
          },
        ]}
        stats={[
          { value: "100", suffix: "+", label: "Accredited Experts" },
          { value: "36", suffix: "+", label: "Global Cities" },
          { value: "10000", suffix: "+", label: "Learners Per Year" },
          { value: "98", suffix: "%", label: "Client Satisfaction" },
        ]}
        values={{
          title: "Our Core Values",
          items: [
            {
              name: "Family",
              desc: "Supporting an environment of safety, security and compassion for our colleagues, clients and stakeholders.",
            },
            {
              name: "Integrity",
              desc: "Displaying appropriate behaviours and business ethics in pursuit of honesty and sincerity.",
            },
            {
              name: "Caring",
              desc: "We care passionately and put our clients' needs firmly at the centre of our focus at all times.",
            },
            {
              name: "Trust",
              desc: "Building authentic relationships through delivering on our vision and living our values.",
            },
          ],
        }}
        ctas={[
          { label: "Explore Corporate Programs", href: "#programs", variant: "primary" },
          { label: "Meet Our Experts", href: "#experts", variant: "secondary" },
        ]}
        theme="darkTextOnLight"
      />

      {/* CEO Message Section */}
      <CEOMessage
        name="John Smith"
        title="Chief Executive Officer"
        message="At TEI Training, we believe that exceptional training is the cornerstone of professional excellence. For over three decades, we have dedicated ourselves to empowering individuals and organizations worldwide with world-class training programs that drive real, measurable results.\n\nOur commitment to excellence, innovation, and integrity has made us a trusted partner for thousands of professionals across the globe. We understand that every learner is unique, and our personalized approach ensures that each participant receives the guidance and support they need to succeed.\n\nAs we look to the future, we remain steadfast in our mission to transform careers and organizations through meaningful learning experiences. We invite you to join us on this journey of growth and discovery."
      />

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Mission & Vision */}
      {/* <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To empower professionals and organizations worldwide with cutting-edge training programs
                that enhance skills, drive performance, and create lasting impact. We are committed to
                delivering excellence in every interaction and transforming careers through meaningful learning.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold text-slate-900">Our Vision</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To be the world's most innovative and trusted training provider, recognized for our
                excellence in professional development and our commitment to human-centered learning.
                We envision a future where every professional has access to world-class training
                that unlocks their full potential.
              </p>
            </CardContent>
          </Card>
        </div>
      </div> */}

      {/* Values
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className={`inline-flex p-3 rounded-xl ${value.bgColor} mb-4`}>
                      <IconComponent className={`w-6 h-6 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div> */}
   <AffiliationsSection />

      {/* Accreditations */}
      {/* <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Accreditations</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Recognized and endorsed by leading professional bodies worldwide
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {accreditations.map((accreditation, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-900">{accreditation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have advanced their careers with our world-class training programs.
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

