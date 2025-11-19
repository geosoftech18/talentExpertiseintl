"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Lock,
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  Settings,
  LogOut,
  Camera,
  Bell,
  Shield,
  CreditCard,
  FileText,
  Star,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function UserProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [profileData, setProfileData] = useState({
    firstName: session?.user?.firstName || session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.lastName || session?.user?.name?.split(" ").slice(1).join(" ") || "",
    email: session?.user?.email || "",
    phone: "",
    bio: "Welcome to my profile! I'm passionate about professional development and continuous learning.",
    location: "",
    dateOfBirth: "",
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Here you would typically save to your API
    // For now, we'll just simulate a save
    setTimeout(() => {
      setIsLoading(false)
      setIsEditing(false)
    }, 1000)
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const stats = [
    { label: "Courses Enrolled", value: "12", icon: BookOpen, color: "text-blue-600" },
    { label: "Certificates", value: "8", icon: Award, color: "text-purple-600" },
    { label: "Hours Learned", value: "156", icon: Clock, color: "text-green-600" },
    { label: "Achievements", value: "5", icon: Star, color: "text-yellow-600" },
  ]

  const recentCourses = [
    { id: 1, name: "Project Management Professional", code: "PMP-101", enrolledDate: "2024-01-15", category: "Project Management" },
    { id: 2, name: "Leadership & Management", code: "LDM-205", enrolledDate: "2024-02-10", category: "Management & Leadership" },
    { id: 3, name: "Digital Marketing Fundamentals", code: "DMF-301", enrolledDate: "2024-03-05", category: "Marketing" },
    { id: 4, name: "Financial Analysis & Reporting", code: "FAR-401", enrolledDate: "2024-03-20", category: "Finance & Accounting" },
    { id: 5, name: "Risk Management Essentials", code: "RME-501", enrolledDate: "2024-04-01", category: "Risk Management" },
  ]

  const achievements = [
    { id: 1, title: "First Course Completed", description: "Completed your first course", icon: CheckCircle2, date: "2024-01-15" },
    { id: 2, title: "Perfect Attendance", description: "Attended 10 consecutive sessions", icon: Star, date: "2024-02-20" },
    { id: 3, title: "Top Performer", description: "Scored 95% in final assessment", icon: TrendingUp, date: "2024-03-10" },
  ]

  const getInitials = () => {
    const firstName = profileData.firstName || ""
    const lastName = profileData.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={session?.user?.image || ""} alt={profileData.firstName} />
                  <AvatarFallback className="bg-white text-blue-600 text-2xl sm:text-3xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 text-white">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                      {profileData.firstName} {profileData.lastName}
                    </h1>
                    <p className="text-blue-100 text-lg mb-4">{profileData.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Student
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="secondary"
                        className="bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={isLoading}
                          variant="secondary"
                          className="bg-white text-green-600 hover:bg-green-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="secondary"
                          className="bg-white text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                    <Button
                      onClick={handleLogout}
                      variant="secondary"
                      className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-slate-100 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                    <CardDescription>Your personal information and bio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Full Name</p>
                              <p className="font-semibold">
                                {profileData.firstName} {profileData.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Email</p>
                              <p className="font-semibold">{profileData.email}</p>
                            </div>
                          </div>
                          {profileData.phone && (
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Phone className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Phone</p>
                                <p className="font-semibold">{profileData.phone}</p>
                              </div>
                            </div>
                          )}
                          {profileData.location && (
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Location</p>
                                <p className="font-semibold">{profileData.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {profileData.bio && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-slate-600 mb-2">Bio</p>
                            <p className="text-slate-700 leading-relaxed">{profileData.bio}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Your enrolled courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentCourses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-lg font-medium mb-2">No courses enrolled yet</p>
                          <p className="text-sm">Start your learning journey by enrolling in a course</p>
                          <Button asChild className="mt-4">
                            <a href="/courses">Browse Courses</a>
                          </Button>
                        </div>
                      ) : (
                        recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow hover:border-blue-300 group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {course.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                                      {course.code && (
                                        <div className="flex items-center gap-1">
                                          <span className="font-medium">Code:</span>
                                          <span className="text-slate-700">{course.code}</span>
                                        </div>
                                      )}
                                      {course.category && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-slate-400">•</span>
                                          <Badge variant="outline" className="text-xs">
                                            {course.category}
                                          </Badge>
                                        </div>
                                      )}
                                      {course.enrolledDate && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-slate-400">•</span>
                                          <Calendar className="w-3 h-3" />
                                          <span>Enrolled: {new Date(course.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                asChild
                              >
                                <a href={`/courses/${course.code?.toLowerCase() || course.id}`}>
                                  View Course
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Achievements</CardTitle>
                    <CardDescription>Your learning milestones and accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {achievements.map((achievement) => {
                        const Icon = achievement.icon
                        return (
                          <div
                            key={achievement.id}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <Icon className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{achievement.title}</h3>
                                <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                                <p className="text-xs text-slate-500">{achievement.date}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="font-semibold">Change Password</p>
                          <p className="text-sm text-slate-600">Update your password regularly</p>
                        </div>
                      </div>
                      <Button variant="outline">Change</Button>
                    {/* </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="font-semibold">Notifications</p>
                          <p className="text-sm text-slate-600">Manage notification preferences</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="font-semibold">Privacy</p>
                          <p className="text-sm text-slate-600">Control your privacy settings</p>
                        </div>
                      </div>
                      <Button variant="outline">Settings</Button>
                    </div> */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/certificates">
                    <Award className="w-4 h-4 mr-2" />
                    View Certificates
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/calendar">
                    <Calendar className="w-4 h-4 mr-2" />
                    My Calendar
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">7</div>
                  <p className="text-sm text-slate-600">Days in a row</p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${
                          i < 7 ? "bg-green-500" : "bg-slate-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

