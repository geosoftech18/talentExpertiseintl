"use client"

import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: LucideIcon
  color: string
}

export default function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="theme-card rounded-xl p-6 hover:border-primary transition-all duration-300 group hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-green-500 bg-muted px-2 py-1 rounded">{change}</span>
      </div>
      <p className="theme-muted text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold theme-text">{value}</p>
    </div>
  )
}
