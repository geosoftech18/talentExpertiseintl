"use client"
import ModernHeroSection from "@/components/home/modern-hero-section"
import CourseFilterSection from "@/components/home/course-filter-section"
import CourseCategoriesSection from "@/components/home/course-categories-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import CTASection from "@/components/home/cta-section"
import UpcomingProgramsSection from "@/components/home/upcoming-programs-section"
import UpcomingProgramsCarousel from "@/components/home/upcoming-programs-carousel"
import AffiliationsSection from "@/components/home/affiliations-section"
import ClientsLogoSection from "@/components/home/clients-logo-section"
import ChooseVenueSection from "@/components/home/choose-venue-section"

export default function Page() {
  return (
    <>
    <ModernHeroSection />
 
   
      <CourseFilterSection />
      {/* Table View - Uncomment to use */}
      {/* <UpcomingProgramsSection /> */}
      
      {/* Carousel View - Uncomment to use */}
      <UpcomingProgramsCarousel />
      
      <CourseCategoriesSection />
      <ChooseVenueSection />
      <ClientsLogoSection />
      <AffiliationsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
