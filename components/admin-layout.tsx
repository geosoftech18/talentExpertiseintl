"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Sidebar from "@/components/sidebar"
import TopBar from "@/components/top-bar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine current page from pathname and query params
  const getCurrentPage = () => {
    if (!pathname) return "dashboard"
    if (pathname.startsWith("/admin/orders/")) return "orders"
    if (pathname === "/admin/orders") return "orders"
    if (pathname.startsWith("/admin/invoice-requests/")) return "invoice-requests"
    if (pathname === "/admin/invoice-requests") return "invoice-requests"
    if (pathname.startsWith("/admin/enquiries/")) return "enquiries"
    if (pathname === "/admin") {
      // Check for page query parameter for SPA pages
      const pageParam = searchParams.get("page")
      if (pageParam) return pageParam
      return "dashboard"
    }
    const page = pathname.replace("/admin/", "").split("/")[0]
    return page || "dashboard"
  }

  const currentPage = getCurrentPage()

  const handleNavigate = (page: string) => {
    // Pages that have dedicated routes
    if (page === "dashboard") {
      router.push("/admin")
    } else if (page === "orders") {
      router.push("/admin/orders")
    } else if (page === "invoice-requests") {
      router.push("/admin/invoice-requests")
    } else {
      // For SPA pages, use query parameter to indicate which page to show
      router.push(`/admin?page=${page}`)
    }
  }

  return (
    <div className="flex h-screen theme-bg">
      <Sidebar isOpen={sidebarOpen} onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto theme-bg">{children}</main>
      </div>
    </div>
  )
}

