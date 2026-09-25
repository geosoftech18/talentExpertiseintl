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
import Users from "@/components/pages/users"
import Admins from "@/components/pages/admins"
import Venues from "@/components/pages/venues"
import AddNewVenue from "@/components/pages/add-new-venue"
import AllSchedules from "@/components/pages/all-schedules"
import CourseEnquiries from "@/components/pages/course-enquiries"
import BrochureDownloads from "@/components/pages/brochure-downloads"
import InHouseRequests from "@/components/pages/in-house-requests"
import Certificates from "@/components/pages/certificates"
import AddNewCertificate from "@/components/pages/add-new-certificate"
import IssuedCertificates from "@/components/pages/issued-certificates"
import DownloadManagement from "@/components/pages/download-management"
import ClientLogos from "@/components/pages/client-logos"
import AffiliationsAdmin from "@/components/pages/affiliations"
import GalleryManagement from "@/components/pages/gallery-management"

function AdminPageContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [previousPage, setPreviousPage] = useState<string>("dashboard")
  const [editId, setEditId] = useState<string | null>(null)
  const [editType, setEditType] = useState<'program' | 'schedule' | 'mentor' | 'venue' | 'team-member' | 'certificate' | null>(null)

  // Sync currentPage / editId with pathname and query params
  useEffect(() => {
    if (pathname === "/admin") {
      const pageParam = searchParams.get("page")
      const idParam = searchParams.get("id")
      if (pageParam) {
        setCurrentPage(pageParam)
      } else {
        setCurrentPage("dashboard")
      }
      setEditId(idParam)
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
    } else if (id) {
      router.push(`/admin?page=${page}&id=${id}`)
    } else {
      router.push(`/admin?page=${page}`)
    }
  }

  const handleBackFromAddProgram = () => {
    setEditId(null)
    const target = previousPage === "dashboard" ? "dashboard" : "courses"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
  }

  const handleBackFromAddSchedule = () => {
    setEditId(null)
    const target =
      previousPage === "all-schedules"
        ? "all-schedules"
        : previousPage === "dashboard"
          ? "dashboard"
          : "schedules"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
  }

  const handleBackFromAddMentor = () => {
    setEditId(null)
    const target = previousPage === "dashboard" ? "dashboard" : "mentors"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
  }

  const handleBackFromAddTeamMember = () => {
    setEditId(null)
    const target = previousPage === "dashboard" ? "dashboard" : "team"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
  }

  const handleBackFromAddVenue = () => {
    setEditId(null)
    const target = previousPage === "dashboard" ? "dashboard" : "locations"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
  }

  const handleBackFromAddCertificate = () => {
    setEditId(null)
    const target = previousPage === "dashboard" ? "dashboard" : "certificate-management"
    setCurrentPage(target)
    router.push(target === "dashboard" ? "/admin" : `/admin?page=${target}`)
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
      case "client-logos":
        return <ClientLogos />
      case "affiliations":
        return <AffiliationsAdmin />
      case "gallery-management":
        return <GalleryManagement />
      case "certificate-management":
        return (
          <Certificates
            onAddCertificate={() => navigateToPage("add-certificate")}
            onEditCertificate={(id) => navigateToPage("add-certificate", id, "certificate")}
          />
        )
      case "issued-certificates":
        return <IssuedCertificates />
      case "download-management":
        return <DownloadManagement />
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
      case "users-list":
        return <Users />
      case "admins":
        return <Admins />
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
