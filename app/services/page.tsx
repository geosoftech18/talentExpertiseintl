'use client'

import { 
  Users, 
  Video, 
  Building2, 
  Briefcase, 
  UsersRound,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

const services = [
  {
    id: 1,
    icon: Users,
    title: 'Face-to-Face Public Training',
    description: 'Our unrivalled faculty of trainers, consultants and specialist facilitators bring learning to life in a very real way.',
    image: '/service/face-to-face.png',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    icon: Video,
    title: 'Virtual Live Training',
    description: 'For those who can\'t attend training in person, we can deliver more than 85% of our advertised face-to-face programs in a virtual environment.',
    image: '/service/live-training.png',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 3,
    icon: Building2,
    title: 'Inhouse Training',
    description: 'All of our advertised programs can be further tailored to meet your specific needs and run as an inhouse program at your location.',
    image: '/service/inhouse.png',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 4,
    icon: Briefcase,
    title: 'Consulting, Mentoring & Coaching',
    description: 'Our key strength is our unwavering approach to putting humanity back into the learning arena.',
    image: '/service/consult.png',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
 
]

const benefits = [
  {
    title: 'Expert Faculty',
    description: 'Learn from industry-leading trainers and consultants',
    icon: Award,
  },
  {
    title: 'Flexible Delivery',
    description: 'Choose from face-to-face, virtual, or inhouse options',
    icon: Target,
  },
  {
    title: 'Customized Solutions',
    description: 'Tailored programs to meet your specific needs',
    icon: Lightbulb,
  },
  {
    title: 'Proven Results',
    description: 'Track record of transforming organizations',
    icon: CheckCircle2,
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-6">
              Our Services
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Comprehensive Training & Development Solutions
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              We offer a wide range of professional training and development services designed to 
              empower individuals and organizations to achieve their full potential.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/10">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Service Offerings
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              From face-to-face training to virtual programs and customized solutions, 
              we provide flexible learning options to suit your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="group border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="relative h-[200px] bg-slate-200 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect fill="%23e5e7eb" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Placeholder%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {/* <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our commitment to excellence and innovation drives everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Service Delivery Methods Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
                Flexible Delivery
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Multiple Ways to Learn
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                We understand that every organization and individual has unique learning preferences 
                and constraints. That's why we offer multiple delivery methods to ensure maximum 
                accessibility and effectiveness.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Face-to-Face Training
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Interactive, hands-on learning in a traditional classroom setting
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Virtual Live Training
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Real-time online training sessions with interactive engagement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Inhouse Programs
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Customized training delivered at your location for your team
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&q=90"
                alt="Training Delivery Methods"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Lightbulb className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover how our comprehensive training and development services can help you 
            achieve your goals and drive success.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-[#0A3049] hover:bg-blue-50">
              <Link href="/courses">
                Browse Our Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 hover:text-white text-[#0A3049] hover:bg-white/10">
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

