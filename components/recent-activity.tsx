"use client"

import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "completion",
      user: "Sarah Johnson",
      action: "completed",
      course: "Advanced Leadership",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "enrollment",
      user: "Michael Chen",
      action: "enrolled in",
      course: "Digital Transformation",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "pending",
      user: "Emma Davis",
      action: "pending approval for",
      course: "Executive Coaching",
      time: "6 hours ago",
    },
    {
      id: 4,
      type: "completion",
      user: "James Wilson",
      action: "completed",
      course: "Team Management",
      time: "1 day ago",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "completion":
        return <CheckCircle size={20} className="text-[#39ff14]" />
      case "enrollment":
        return <CheckCircle size={20} className="text-[#00d9ff]" />
      case "pending":
        return <AlertCircle size={20} className="text-[#ff006e]" />
      default:
        return <Clock size={20} className="text-[#8b92a9]" />
    }
  }

  return (
    <div className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-[#e8eef7] mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-4 bg-[#2a3142] rounded-lg hover:bg-[#3a4152] transition-colors"
          >
            {getIcon(activity.type)}
            <div className="flex-1">
              <p className="text-[#e8eef7] text-sm">
                <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                <span className="text-[#00d9ff]">{activity.course}</span>
              </p>
              <p className="text-[#8b92a9] text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
