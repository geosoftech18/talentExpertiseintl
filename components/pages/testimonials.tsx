"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Search } from "lucide-react"

export default function Testimonials() {
  const [testimonials] = useState([
    {
      id: 1,
      delegate: "Sarah M.",
      role: "HR Manager",
      program: "Strategic HR Business Partner",
      feedback: "An insightful and transformative program...",
      status: "Approved",
    },
    {
      id: 2,
      delegate: "Ahmed R.",
      role: "Finance Director",
      program: "Advanced Budgeting & Cost Control",
      feedback: "Highly recommend this course for its practical applications...",
      status: "Approved",
    },
    {
      id: 3,
      delegate: "Dr. Emily Chen",
      role: "Geologist",
      program: "Process Safety Management (PSM)",
      feedback: "The instructors were incredibly knowledgeable...",
      status: "Pending",
    },
    {
      id: 4,
      delegate: "Mark T.",
      role: "Project Lead",
      program: "Certified Project Management Professional (PMP)®",
      feedback: "Helped me solidify my PMP knowledge...",
      status: "Approved",
    },
  ])

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Testimonials</h1>
          <p className="theme-muted">Manage student feedback and reviews</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all">
          <Plus size={20} />
          Add New Testimonial
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search testimonials..."
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
          <option>All Status</option>
          <option>Approved</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Testimonials Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Delegate</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Feedback Excerpt</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Approval Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="theme-text font-medium">{testimonial.delegate}</p>
                    <p className="text-xs theme-muted">{testimonial.role}</p>
                  </div>
                </td>
                <td className="px-6 py-4 theme-text">{testimonial.program}</td>
                <td className="px-6 py-4 theme-muted max-w-xs truncate">{testimonial.feedback}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      testimonial.status === "Approved"
                        ? "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {testimonial.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
