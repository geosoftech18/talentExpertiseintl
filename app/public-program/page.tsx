'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils/slug'
import { Badge } from '@/components/ui/badge'

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
      

      {/* Categories Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {programCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 hover:border-[#0A3049]"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    const target = e.currentTarget as HTMLImageElement
                    target.src = `https://placehold.co/400x400/0A3049/FFFFFF?text=${encodeURIComponent(category.title.split(' ')[0])}`
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#0A3049]/0 group-hover:bg-[#0A3049]/20 transition-colors duration-300" />
              </div>
              
              {/* Category Title */}
              <div className="p-4 bg-white">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[#0A3049] transition-colors text-center line-clamp-2">
                  {category.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

