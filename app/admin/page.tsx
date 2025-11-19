"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Dashboard from "@/components/pages/dashboard"
import CourseManagement from "@/components/pages/course-management"
import Testimonials from "@/components/pages/testimonials"
import CourseRegistrations from "@/components/pages/course-registrations"
import AddNewProgram from "@/components/pages/add-new-program"
import AddNewSchedule from "@/components/pages/add-new-schedule"
import Mentors from "@/components/pages/mentors"
import AddNewMentor from "@/components/pages/add-new-mentor"
import TeamMembers from "@/components/pages/team-members"
import AddNewTeamMember from "@/components/pages/add-new-team-member"
import Venues from "@/components/pages/venues"
import AddNewVenue from "@/components/pages/add-new-venue"
import AllSchedules from "@/components/pages/all-schedules"
import CourseEnquiries from "@/components/pages/course-enquiries"
import BrochureDownloads from "@/components/pages/brochure-downloads"
import InHouseRequests from "@/components/pages/in-house-requests"
import Certificates from "@/components/pages/certificates"
import AddNewCertificate from "@/components/pages/add-new-certificate"

function AdminPageContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [previousPage, setPreviousPage] = useState<string>("dashboard")
  const [editId, setEditId] = useState<string | null>(null)
  const [editType, setEditType] = useState<'program' | 'schedule' | 'mentor' | 'venue' | 'team-member' | 'certificate' | null>(null)

  // Sync currentPage with pathname and query params
  useEffect(() => {
    if (pathname === "/admin") {
      // Check for page query parameter
      const pageParam = searchParams.get("page")
      if (pageParam) {
        setCurrentPage(pageParam)
      } else {
        setCurrentPage("dashboard")
      }
    } else if (pathname?.startsWith("/admin/")) {
      // Don't handle orders here as it has its own route
      if (!pathname.startsWith("/admin/orders")) {
        const page = pathname.replace("/admin/", "").split("/")[0]
        setCurrentPage(page || "dashboard")
      }
    }
  }, [pathname, searchParams])

  const navigateToPage = (page: string, id?: string, type?: 'program' | 'schedule' | 'mentor' | 'venue' | 'team-member' | 'certificate') => {
    setPreviousPage(currentPage)
    setEditId(id || null)
    setEditType(type || null)
    setCurrentPage(page)
    
    // Navigate using router for pages that have routes
    if (page === "orders") {
      router.push("/admin/orders")
    } else {
      // For SPA pages, just update state
      setCurrentPage(page)
    }
  }

  const handleBackFromAddProgram = () => {
    setCurrentPage(previousPage === "dashboard" ? "dashboard" : "courses")
  }

  const handleBackFromAddSchedule = () => {
    if (previousPage === "all-schedules") {
      setCurrentPage("all-schedules")
    } else {
      setCurrentPage(previousPage === "dashboard" ? "dashboard" : "schedules")
    }
  }

  const handleBackFromAddMentor = () => {
    setCurrentPage(previousPage === "dashboard" ? "dashboard" : "mentors")
  }

  const handleBackFromAddTeamMember = () => {
    setCurrentPage(previousPage === "dashboard" ? "dashboard" : "team")
  }

  const handleBackFromAddVenue = () => {
    setCurrentPage(previousPage === "dashboard" ? "dashboard" : "locations")
  }

  const handleBackFromAddCertificate = () => {
    setCurrentPage(previousPage === "dashboard" ? "dashboard" : "certificate-management")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onAddProgram={() => navigateToPage("add-program")}
            onViewRegistrations={() => setCurrentPage("registrations")}
            onManageTestimonials={() => setCurrentPage("testimonials")}
          />
        )
      case "courses":
      case "programs":
      case "schedules":
        return (
          <CourseManagement
            onAddProgram={() => navigateToPage("add-program")}
            onAddSchedule={() => navigateToPage("add-schedule")}
            onEditProgram={(id) => navigateToPage("add-program", id, "program")}
            onEditSchedule={(id) => navigateToPage("add-schedule", id, "schedule")}
            initialTab={currentPage === "schedules" ? "schedules" : "programs"}
          />
        )
      case "all-schedules":
        return (
          <AllSchedules
            onAddSchedule={() => navigateToPage("add-schedule")}
            onEditSchedule={(id) => navigateToPage("add-schedule", id, "schedule")}
          />
        )
      case "testimonials":
        return <Testimonials />
      case "certificate-management":
        return (
          <Certificates
            onAddCertificate={() => navigateToPage("add-certificate")}
            onEditCertificate={(id) => navigateToPage("add-certificate", id, "certificate")}
          />
        )
      case "registrations":
        return <CourseRegistrations />
      case "enquiries":
        return <CourseEnquiries />
      case "brochure-downloads":
        return <BrochureDownloads />
      case "in-house-requests":
        return <InHouseRequests />
      case "mentors":
        return <Mentors 
          onAddMentor={() => navigateToPage("add-mentor")}
          onEditMentor={(id) => navigateToPage("add-mentor", id, "mentor")}
        />
      case "team":
        return <TeamMembers 
          onAddTeamMember={() => navigateToPage("add-team-member")}
          onEditTeamMember={(id) => navigateToPage("add-team-member", id, "team-member")}
        />
      case "locations":
        return <Venues 
          onAddVenue={() => navigateToPage("add-venue")}
          onEditVenue={(id) => navigateToPage("add-venue", id, "venue")}
        />
      case "add-program":
        return <AddNewProgram onBack={handleBackFromAddProgram} editId={editId} />
      case "add-schedule":
        return <AddNewSchedule onBack={handleBackFromAddSchedule} editId={editId} />
      case "add-mentor":
        return <AddNewMentor onBack={handleBackFromAddMentor} editId={editId} />
      case "add-team-member":
        return <AddNewTeamMember onBack={handleBackFromAddTeamMember} editId={editId} />
      case "add-venue":
        return <AddNewVenue onBack={handleBackFromAddVenue} editId={editId} />
      case "add-certificate":
        return <AddNewCertificate onBack={handleBackFromAddCertificate} editId={editId} />
      default:
        return (
          <Dashboard
            onAddProgram={() => navigateToPage("add-program")}
            onViewRegistrations={() => setCurrentPage("registrations")}
            onManageTestimonials={() => setCurrentPage("testimonials")}
          />
        )
    }
  }

  return <>{renderPage()}</>
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <AdminPageContent />
    </Suspense>
  )
}
