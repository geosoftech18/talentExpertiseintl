"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react"

interface TeamMember {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  image: string | null
  role: string
  department: string
  status: "Active" | "Inactive" | "Suspended"
  joinDate: string
  lastLogin: string | null
}

export default function TeamMembers({ onAddTeamMember, onEditTeamMember }: { onAddTeamMember?: () => void; onEditTeamMember?: (id: string) => void }) {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@tei.com",
      phone: "+1 234-567-8900",
      image: "/placeholder-user.jpg",
      role: "Admin",
      department: "Management",
      status: "Active",
      joinDate: "2023-01-15",
      lastLogin: "2024-01-20 14:30",
    },
    {
      id: 2,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@tei.com",
      phone: "+1 234-567-8901",
      image: "/placeholder-user.jpg",
      role: "Content Manager",
      department: "Content",
      status: "Active",
      joinDate: "2023-03-10",
      lastLogin: "2024-01-20 10:15",
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@tei.com",
      phone: "+1 234-567-8902",
      image: "/placeholder-user.jpg",
      role: "Course Coordinator",
      department: "Course Management",
      status: "Active",
      joinDate: "2023-05-22",
      lastLogin: "2024-01-19 16:45",
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@tei.com",
      phone: "+1 234-567-8903",
      image: "/placeholder-user.jpg",
      role: "Support Staff",
      department: "Support",
      status: "Inactive",
      joinDate: "2023-07-08",
      lastLogin: "2024-01-15 09:20",
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@tei.com",
      phone: "+1 234-567-8904",
      image: "/placeholder-user.jpg",
      role: "Course Coordinator",
      department: "Course Management",
      status: "Active",
      joinDate: "2023-09-12",
      lastLogin: "2024-01-20 11:00",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-500 dark:bg-green-400/20 dark:text-green-400"
      case "Inactive":
        return "bg-gray-500/20 text-gray-500 dark:bg-gray-400/20 dark:text-gray-400"
      case "Suspended":
        return "bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Team Members</h1>
          <p className="theme-muted">Manage all team members and their access</p>
        </div>
        <button
          onClick={onAddTeamMember}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg glow-electric transition-all"
        >
          <Plus size={20} />
          Add New Team Member
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Suspended</option>
        </select>
        <select className="px-4 py-2 bg-input border border-border rounded-lg theme-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
          <option>All Roles</option>
          <option>Admin</option>
          <option>Content Manager</option>
          <option>Course Coordinator</option>
          <option>Support Staff</option>
        </select>
      </div>

      {/* Team Members Table */}
      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Profile</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Join Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Last Login</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    <img
                      src={member.image || "/placeholder-user.jpg"}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-text font-medium">{member.firstName} {member.lastName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-muted">{member.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-muted text-sm">{member.phone || "N/A"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-text font-medium">{member.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-muted text-sm">{member.department}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-muted text-sm">{member.joinDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="theme-muted text-sm">{member.lastLogin || "Never"}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary" title="View Details">
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => onEditTeamMember && onEditTeamMember(String(member.id))}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary" 
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teamMembers.length === 0 && (
          <div className="text-center py-12 theme-muted">
            <p className="text-lg">No team members found</p>
            <p className="text-sm mt-2">Click "Add New Team Member" to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

