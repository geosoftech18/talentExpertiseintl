'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils/slug'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, BookOpen, TrendingUp, Users, Award } from 'lucide-react'

// All categories with their details - matching header categories exactly
const programCategories = [
  {
    id: "admin",
    title: "Administration & Secretarial",
    image: "/categories/administration-secretarial.jpg",
  },
  {
    id: "contracts",
    title: "Contracts Management",
    image: "/categories/contract-management.jpg",
  },
  {
    id: "customer-service",
    title: "Customer Service",
    image: "/categories/customer-service.jpg",
  },
  {
    id: "cunstruction-management",
    title: "Construction Management",
    image: "/categories/customer-service.jpg",
  },
  {
    id: "electrical",
    title: "Electrical Engineering",
    image: "/categories/electrical-engineering.jpg",
  },
  {
    id: "finance",
    title: "Banking, Finance & Accounting",
    image: "/categories/banking-finance-accounting.jpg",
  },
  {
    id: "quality",
    title: "Quality, Health & Safety",
    image: "/categories/quality-health-safety.jpg",
  },
  {
    id: "hr",
    title: "Human Resources ",
    image: "/categories/human-resources.jpg",
  },
  {
    id: "it",
    title: "Information Technology",
    image: "/categories/information-technology.jpg",
  },
  {
    id: "maintenance",
    title: "Maintenance Management",
    image: "/categories/maintenance-management.jpg",
  },
  {
    id: "management",
    title: "Management & Leadership",
    image: "/categories/management-leadership.jpg",
  },
  {
    id: "mechanical",
    title: "Mechanical Engineering",
    image: "/categories/mechanical-engineering.jpg",
  },
  {
    id: "oil-gas",
    title: "Oil & Gas",
    image: "/categories/oil-gas.jpg",
  },
  {
    id: "project",
    title: "Project Management",
    image: "/categories/project-management.jpg",
  },
  {
    id: "public-relations",
    title: "Public Relations",
    image: "/categories/public-relations.jpg",
  },
  {
    id: "purchasing",
    title: "Purchasing Management",
    image: "/categories/purchasing-management.jpg",
  },
  {
    id: "urban-planning",
    title: "Urban Planning & Development",
    image: "/categories/urban-planning-development.jpg",
  },
  {
    id: "ship-port",
    title: "Ships & Port Management",
    image: "/categories/urban-planning-development.jpg",
  },
  {
    id: "law",
    title: "Law & Legel Training Programs",
    image: "/categories/urban-planning-development.jpg",
  },
  {
    id: "mining",
    title: "Mining Engineering",
    image: "/categories/urban-planning-development.jpg",
  },
  {
    id: "police & law enforcement",
    title: "Police & Law Enforcement",
    image: "/categories/urban-planning-development.jpg",
  },
  {
    id: "artificial intelligence",
    title: "Artificial Intelligence (AI)",
    image: "/categories/urban-planning-development.jpg",
  },
]


export default function PublicProgramPage() {
  const router = useRouter()

  const handleCategoryClick = (category: typeof programCategories[0]) => {
    router.push(`/courses/category/${encodeURIComponent(category.title)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-white border-blue-400/30 mb-6">
              Categories
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Public Programmes
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
           
              Explore our comprehensive range of professional training programs across various industries and disciplines. 
              Each category offers specialized courses designed to enhance your skills and advance your career.
            </p>
          </div>
        </div>
      </div>
      

      {/* Stats Section */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-900 mb-1">300+</div>
            <div className="text-sm text-blue-700 font-medium">Training Programs</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-900 mb-1">50K+</div>
            <div className="text-sm text-purple-700 font-medium">Professionals Trained</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <Award className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-900 mb-1">100+</div>
            <div className="text-sm text-green-700 font-medium">Expert Trainers</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
            <TrendingUp className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-900 mb-1">95%</div>
            <div className="text-sm text-orange-700 font-medium">Success Rate</div>
          </div>
        </div>
      </div> */}

      {/* Categories Grid Section - Unique Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#0A3049]" />
            <Badge variant="outline" className="border-[#0A3049]/30 text-[#0A3049] bg-[#0A3049]/5">
              Explore Categories
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through our specialized training categories and discover programs tailored to your professional growth
          </p>
        </div>

        {/* Unique Grid Layout - Staggered Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {programCategories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200 hover:border-[#0A3049] transform hover:-translate-y-2"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A3049]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Container with Parallax Effect */}
              <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-all duration-700 "
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.src = `https://placehold.co/400x300/0A3049/FFFFFF?text=${encodeURIComponent(category.title.split(' ')[0])}`
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-[#0A3049]">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 bg-white relative">
                {/* Decorative Element */}
                <div className="absolute top-0 left-6 w-12 h-1 bg-gradient-to-r from-[#0A3049] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0A3049] transition-colors  line-clamp-2 min-h-[1.5rem]">
                  {category.title}
                </h3>
                
                {/* Action Button */}
                <div className="flex items-center justify-between  border-t border-slate-100 group-hover:border-[#0A3049]/30 transition-colors">
                  <span className="text-sm text-slate-600 group-hover:text-[#0A3049] font-medium transition-colors">
                    View Programs
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0A3049] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0A3049]/10 via-transparent to-transparent blur-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-[#0A3049] to-[#0A3049]/90 rounded-3xl shadow-2xl border border-[#0A3049]/20">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Contact us to discuss custom training solutions tailored to your organization's specific needs
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0A3049] font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Custom Quote
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

