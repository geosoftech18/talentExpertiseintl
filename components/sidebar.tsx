"use client"

import {
  LayoutDashboard,
  BookOpen,
  MapPin,
  FileText,
  Users,
  Briefcase,
  Settings,
  LogOut,
  ChevronDown,
  FileCheck,
} from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps {
  isOpen: boolean
  onNavigate: (page: string) => void
  currentPage: string
}

export default function Sidebar({ isOpen, onNavigate, currentPage }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [invoiceRequestCount, setInvoiceRequestCount] = useState<number>(0)

  // Fetch pending invoice requests count
  useEffect(() => {
    const fetchInvoiceRequestCount = async () => {
      try {
        const response = await fetch('/api/admin/invoice-requests?status=PENDING&limit=1')
        const result = await response.json()
        if (result.success && result.pagination) {
          setInvoiceRequestCount(result.pagination.total)
        }
      } catch (error) {
        console.error('Error fetching invoice request count:', error)
      }
    }

    fetchInvoiceRequestCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchInvoiceRequestCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      submenu: [
        { id: "programs", label: "Courses" },
        { id: "schedules", label: "Schedule" },
        { id: "all-schedules", label: "All Schedules" },
      ],
    },
    { id: "locations", label: "Venue Management", icon: MapPin },
    {
      id: "content",
      label: "Content Management",
      icon: FileText,
      submenu: [
        { id: "testimonials", label: "Testimonials" },
        { id: "certificate-management", label: "Certificate Management" },
      ],
    },
    {
      id: "users",
      label: "User & Team Management",
      icon: Users,
      submenu: [
        { id: "team", label: "Team Members" },
        { id: "mentors", label: "Mentors" },
      ],
    },
    { id: "orders", label: "Orders", icon: Briefcase },
    { id: "invoice-requests", label: "Invoice Requests", icon: FileCheck },
    {
      id: "leads",
      label: "Lead & Inquiry Management",
      icon: FileText,
      submenu: [
        { id: "registrations", label: "Registrations" },
        { id: "enquiries", label: "Course Enquiries" },
        { id: "brochure-downloads", label: "Brochure Downloads" },
        { id: "in-house-requests", label: "In-House Requests" },
      ],
    },
    { id: "settings", label: "System Settings", icon: Settings },
  ]

  const toggleSubmenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id)
  }

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } theme-card border-r transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          {isOpen && <span className="ml-3 font-bold theme-primary">TEI</span>}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          // Check if current page matches item or any of its submenu items
          const isActive = currentPage === item.id || (item.submenu?.some(sub => currentPage === sub.id) ?? false)
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = expandedMenu === item.id || (hasSubmenu && item.submenu?.some(sub => currentPage === sub.id))

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    toggleSubmenu(item.id)
                    // If clicking on Course Management, navigate to programs tab
                    if (item.id === "courses" && !isExpanded) {
                      onNavigate("programs")
                    }
                  } else {
                    onNavigate(item.id)
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg glow-electric"
                    : "theme-muted hover:theme-text hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                {isOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.id === "invoice-requests" && invoiceRequestCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {invoiceRequestCount > 99 ? '99+' : invoiceRequestCount}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && isOpen && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      onClick={() => onNavigate(subitem.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                        currentPage === subitem.id
                          ? "bg-accent/20 text-accent"
                          : "theme-muted hover:theme-text hover:bg-muted"
                      }`}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg theme-muted hover:text-destructive transition-colors">
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
