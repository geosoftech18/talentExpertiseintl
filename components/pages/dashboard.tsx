"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, BookOpen, HelpCircle } from "lucide-react"
import StatCard from "@/components/stat-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardProps {
  onAddProgram?: () => void
  onViewRegistrations?: () => void
  onManageTestimonials?: () => void
}

interface DashboardData {
  stats: {
    totalPublishedPrograms: number
    totalActiveVenues: number
    newRegistrations: number
    registrationsChange: string
    newEnquiries: number
    enquiriesChange: string
  }
  chartData: Array<{ month: string; registrations: number }>
  pendingItems: {
    recentRegistrations: Array<{ name: string; program: string; date: string }>
    recentEnquiries: Array<{ name: string; program: string; date: string }>
  }
}

export default function Dashboard({ onAddProgram, onViewRegistrations, onManageTestimonials }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/dashboard')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dashboard data')
        }
        
        setData(result.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8 theme-bg">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-8 theme-bg">
        <div className="theme-card rounded-xl p-6">
          <p className="text-destructive">Error: {error || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      label: "Total Live Courses", 
      value: data.stats.totalPublishedPrograms.toString(), 
      change: "+0", 
      icon: BookOpen, 
      color: "from-[#00d9ff] to-[#00f5d4]" 
    },
    { 
      label: "Total Training Locations", 
      value: data.stats.totalActiveVenues.toString(), 
      change: "+0", 
      icon: Users, 
      color: "from-[#39ff14] to-[#00f5d4]" 
    },
    {
      label: "New Registrations (30 Days)",
      value: data.stats.newRegistrations.toString(),
      change: data.stats.registrationsChange,
      icon: TrendingUp,
      color: "from-[#8b5cf6] to-[#00d9ff]",
    },
    {
      label: "New Inquiries (30 Days)",
      value: data.stats.newEnquiries.toString(),
      change: data.stats.enquiriesChange,
      icon: HelpCircle,
      color: "from-[#ff006e] to-[#8b5cf6]",
    },
  ]

  const chartData = data.chartData
  const pendingInquiries = data.pendingItems.recentEnquiries
  const pendingTestimonials: Array<{ name: string; program: string; status: string }> = [] // No testimonials in database yet

  return (
    <div className="p-8 space-y-8 theme-bg">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold theme-text mb-2">Dashboard</h1>
        <p className="theme-muted">Welcome back! Here's your training course overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={onAddProgram}
          className="px-6 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
        >
          Add New Course
        </button>
        <button 
          onClick={onViewRegistrations}
          className="px-6 py-4 theme-card text-primary rounded-lg font-semibold hover:bg-muted transition-all"
        >
          View All Registrations
        </button>
        <button 
          onClick={onManageTestimonials}
          className="px-6 py-4 theme-card text-accent rounded-lg font-semibold hover:bg-muted transition-all"
        >
          Manage Testimonials
        </button>
      </div>

      {/* Charts and Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 theme-card rounded-xl p-6">
          <h2 className="text-xl font-bold theme-text mb-6">Registrations per Month (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="theme-muted" />
              <YAxis className="theme-muted" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))", 
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))"
                }}
                labelStyle={{ color: "hsl(var(--card-foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                className="stroke-primary"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Items */}
        <div className="theme-card rounded-xl p-6">
          <h2 className="text-xl font-bold theme-text mb-4">Pending Items</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold theme-primary mb-2">New Inquiries</h3>
              <div className="space-y-2">
                {pendingInquiries.length > 0 ? (
                  pendingInquiries.map((inquiry, idx) => (
                    <div key={idx} className="text-xs theme-muted bg-muted p-2 rounded">
                      <p className="font-medium theme-text">{inquiry.name}</p>
                      <p>{inquiry.program}</p>
                      <p className="theme-muted">{inquiry.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs theme-muted italic">No recent inquiries</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold theme-accent mb-2">Pending Testimonials</h3>
              <div className="space-y-2">
                {pendingTestimonials.length > 0 ? (
                  pendingTestimonials.map((testimonial, idx) => (
                    <div key={idx} className="text-xs theme-muted bg-muted p-2 rounded">
                      <p className="font-medium theme-text">{testimonial.name}</p>
                      <p>{testimonial.program}</p>
                      <p className="theme-accent">{testimonial.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs theme-muted italic">No pending testimonials</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
