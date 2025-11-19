"use client"

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ChartCardProps {
  title: string
  type: "line" | "bar" | "pie"
}

export default function ChartCard({ title, type }: ChartCardProps) {
  const lineData = [
    { month: "Jan", students: 400, courses: 24 },
    { month: "Feb", students: 520, courses: 26 },
    { month: "Mar", students: 680, courses: 28 },
    { month: "Apr", students: 890, courses: 30 },
    { month: "May", students: 1200, courses: 32 },
    { month: "Jun", students: 1847, courses: 24 },
  ]

  const pieData = [
    { name: "Leadership", value: 35 },
    { name: "Technical", value: 28 },
    { name: "Soft Skills", value: 22 },
    { name: "Other", value: 15 },
  ]

  const colors = ["#00d9ff", "#00f5d4", "#39ff14", "#8b5cf6"]

  return (
    <div className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-[#e8eef7] mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" && (
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis stroke="#8b92a9" />
            <YAxis stroke="#8b92a9" />
            <Tooltip contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3142", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#00d9ff" strokeWidth={2} dot={{ fill: "#00d9ff" }} />
            <Line type="monotone" dataKey="courses" stroke="#00f5d4" strokeWidth={2} dot={{ fill: "#00f5d4" }} />
          </LineChart>
        )}
        {type === "pie" && (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3142", borderRadius: "8px" }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
