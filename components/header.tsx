'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Calendar,
  Award,
  Building,
  FileText,
  Users,
  GraduationCap,
  BarChart3,
  Briefcase,
  Settings,
  Shield,
  Zap,
  Target,
  DollarSign,
  MessageSquare,
  Building2,
  Code,
  Wrench,
  Lightbulb,
  HeadphonesIcon,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  LogIn,
  User,
  LogOut,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
// AuthModal removed - using full page auth instead

// Categories from courses data - dynamically imported or matched from courses
const courseCategories = [
  'Admin & Secretarial',
  'Contracts Management',
  'Customer Service',
  'Electrical Engineering',
  'Finance & Accounting',
  'Health & Safety',
  'HR Management',
  'Information Technology',
  'Maintenance Management',
  'Management & Leadership',
  'Mechanical Engineering',
  'Oil & Gas',
  'Project Management',
  'Public Relations',
  'Purchasing Management',
  'Urban Planning & Development',
  
]

export default function Header() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTrainingSubjectsOpen, setIsTrainingSubjectsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subjectsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Auth modal removed - using full page auth at /auth

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset training subjects state when mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsTrainingSubjectsOpen(false)
    }
  }, [isMobileMenuOpen])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
      if (subjectsTimeoutRef.current) {
        clearTimeout(subjectsTimeoutRef.current)
      }
    }
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const getInitials = () => {
    if (session?.user?.name) {
      const names = session.user.name.split(' ')
      return `${names[0]?.charAt(0) || ''}${names[1]?.charAt(0) || ''}`.toUpperCase()
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm py-2 border-b border-slate-700 relative z-[100]">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+971-4-5473010</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@talenexpertiseintl.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
            
              <Link
                href="/"
                className="px-4 py-2  font-medium transition-colors rounded-lg "
              >
                Home
              </Link>
              <span className="text-slate-500">|</span>
              {/* About Us Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current)
                    dropdownTimeoutRef.current = null
                  }
                  setOpenDropdown('about')
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setOpenDropdown(null)
                  }, 300)
                }}
              >
                <Link
                  href="/about"
                  className="flex items-center gap-1 px-4 py-2 font-medium transition-colors rounded-lg "
                >
                  About Us
                  <ChevronDown className="w-4 h-4" />
                </Link>
                {openDropdown === 'about' && (
                  <>
                    {/* Invisible bridge to cover the gap */}
                    <div 
                      className="absolute top-full left-0 w-56 h-2"
                      style={{ zIndex: 10000 }}
                      onMouseEnter={() => {
                        if (dropdownTimeoutRef.current) {
                          clearTimeout(dropdownTimeoutRef.current)
                          dropdownTimeoutRef.current = null
                        }
                        setOpenDropdown('about')
                      }}
                    />
                    <div 
                      className="absolute top-full left-0 mt-2 w-56 animate-slide-down" 
                      style={{ zIndex: 10000 }}
                      onMouseEnter={() => {
                        if (dropdownTimeoutRef.current) {
                          clearTimeout(dropdownTimeoutRef.current)
                          dropdownTimeoutRef.current = null
                        }
                        setOpenDropdown('about')
                      }}
                      onMouseLeave={() => {
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null)
                        }, 500)
                      }}
                    >
                      <div className="bg-slate-50 rounded-xl shadow-2xl border border-slate-300 p-2">
                        <Link
                          href="/services"
                          className="block px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 hover:text-[#0A3049] font-medium"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Services
                        </Link>
                        <Link
                          href="/coaching"
                          className="block px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 hover:text-[#0A3049] font-medium"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Coaching
                        </Link>
                        <Link
                          href="/consulting"
                          className="block px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 hover:text-[#0A3049] font-medium"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Consulting
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <span className="text-slate-500">|</span>
              <Link href="/why-choose-tei" className="font-medium transition-colors">
                Why Choose TEI
                </Link>
              <span className="text-slate-500">|</span>
              <Link href="/downloads" className="font-medium transition-colors">
                Downloads
              </Link>
              <span className="text-slate-500">|</span>
              <Link
                href="/contact"
                className="px-4 py-2 font-medium transition-colors rounded-lg "
              >
                Contact Us
              </Link>
              {/* <span className="text-slate-500">|</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>العربية</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200'
            : 'bg-white border-b border-slate-200'
        }`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">TEI Training</div>
                <div className="text-xs text-slate-600">Talent Expertise International</div>
              </div> */}
              <Image 
                src="/talent-logo.png" 
                alt="TEI Training" 
                width={250} 
                height={200}
                className="w-48 h-auto md:w-48 lg:w-[250px]"
              />
            
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* <Link
                href="/"
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-blue-50"
              >
                Home
              </Link> */}
                  <Link
                href="/calendar"
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-[#0A3049] font-medium transition-colors rounded-lg hover:bg-[#0A3049]/5"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Link>

              {/* Training Subjects Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (subjectsTimeoutRef.current) {
                    clearTimeout(subjectsTimeoutRef.current)
                    subjectsTimeoutRef.current = null
                  }
                  setOpenDropdown('subjects')
                }}
                onMouseLeave={() => {
                  subjectsTimeoutRef.current = setTimeout(() => {
                    setOpenDropdown(null)
                  }, 500)
                }}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-[#0A3049] font-medium transition-colors rounded-lg hover:bg-[#0A3049]/5">
                  Training Programs
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === 'subjects' && (
                  <>
                    {/* Invisible bridge to cover the gap */}
                    <div 
                      className="absolute top-full left-0 w-[600px] h-2 z-50"
                      onMouseEnter={() => {
                        if (subjectsTimeoutRef.current) {
                          clearTimeout(subjectsTimeoutRef.current)
                          subjectsTimeoutRef.current = null
                        }
                        setOpenDropdown('subjects')
                      }}
                    />
                    <div 
                      className="absolute top-full left-0 mt-2 w-[600px] animate-slide-down z-50"
                      onMouseEnter={() => {
                        if (subjectsTimeoutRef.current) {
                          clearTimeout(subjectsTimeoutRef.current)
                          subjectsTimeoutRef.current = null
                        }
                        setOpenDropdown('subjects')
                      }}
                      onMouseLeave={() => {
                        subjectsTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null)
                        }, 500)
                      }}
                    >
                      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {courseCategories.map((category, index) => (
                            <Link
                              key={index}
                              href={`/courses?category=${encodeURIComponent(category)}`}
                              className="block px-4 py-3 text-slate-700 hover:text-[#0A3049] hover:bg-[#0A3049]/5 rounded-lg transition-colors group"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium group-hover:text-[#0A3049] text-sm">{category}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              
              <Link
                href="/venues"
                className="px-4 py-2 text-slate-700 hover:text-[#0A3049] font-medium transition-colors rounded-lg hover:bg-[#0A3049]/5"
              >
               Training Venues
              </Link>
          

              <Link
                href="/certificates"
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-[#0A3049] font-medium transition-colors rounded-lg hover:bg-[#0A3049]/5"
              >
                <Award className="w-4 h-4" />
                Certificates
              </Link>

              

              {/* <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('resources')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-blue-50">
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === 'resources' && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-slide-down">
                    <Link
                      href="/resources/articles"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0A3049]/5 transition-colors group"
                    >
                      <FileText className="w-5 h-5 text-[#0A3049]" />
                      <span className="group-hover:text-[#0A3049]">Articles</span>
                    </Link>
                    <Link
                      href="/resources/testimonials"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0A3049]/5 transition-colors group"
                    >
                      <MessageSquare className="w-5 h-5 text-[#0A3049]" />
                      <span className="group-hover:text-[#0A3049]">Testimonials</span>
                    </Link>
                    <Link
                      href="/resources/videos"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0A3049]/5 transition-colors group"
                    >
                      <Users className="w-5 h-5 text-[#0A3049]" />
                      <span className="group-hover:text-[#0A3049]">Videos</span>
                    </Link>
                  </div>
                )}
              </div> */}

              
            </nav>

            {/* Login and CTA */}
            <div className="flex items-center gap-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center gap-2 hover:bg-[#0A3049]/5 transition-all duration-300"
                    >
                      <Avatar className="w-8 h-8 border-2 border-blue-600">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="bg-[#0A3049] text-white text-sm font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">{session.user?.name || 'User'}</span>
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=courses" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=achievements" className="cursor-pointer">
                        <Award className="mr-2 h-4 w-4" />
                        <span>Certificates</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  className="hidden md:flex items-center gap-2 border-2 border-[#0A3049] text-[#0A3049] hover:bg-[#0A3049]/5 hover:text-[#0A3049] font-semibold transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/auth">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )}
              <Button
                asChild
                className="hidden sm:flex bg-[#0A3049] hover:bg-[#0A3049]/90 text-white"
              >
                <Link href="/courses">
                  Course Finder
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="!w-6 !h-6" /> : <Menu className="!w-6 !h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white relative" style={{ minHeight: 'calc(100vh - 5rem)', maxHeight: 'calc(100vh - 5rem)' }}>
            {/* Main Menu */}
            {!isTrainingSubjectsOpen && (
              <div className="px-4 py-4 space-y-2 overflow-y-auto h-full">
                <Link
                  href="/"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {/* Training Subjects Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setIsTrainingSubjectsOpen(true)
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors text-left"
                >
                  <span>Training Programs</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </button>

                <Link
                  href="/calendar"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Calendar
                </Link>
                <Link
                  href="/certificates"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Certificates
                </Link>
                <Link
                  href="/venues"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Training Venues
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Button
                  asChild
                  className="w-full mt-4 bg-[#0A3049] hover:bg-[#0A3049]/90 text-white"
                >
                  <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>
                    Course Finder
                  </Link>
                </Button>
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session.user?.name || 'Profile'}</span>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-2 border-[#0A3049] text-[#0A3049] hover:bg-[#0A3049]/5 font-semibold"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/auth">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login / Sign Up
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Training Subjects Submenu */}
            <div 
              className={`absolute inset-0 bg-white px-4 py-4 space-y-2 overflow-y-auto transition-transform duration-300 ease-in-out ${
                isTrainingSubjectsOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* Back Button Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 sticky top-0 bg-white z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setIsTrainingSubjectsOpen(false)
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-slate-900">Training Subjects</h3>
              </div>

              {/* Categories List */}
              <div className="space-y-1">
                {courseCategories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/courses?category=${encodeURIComponent(category)}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#0A3049]/5 text-slate-700 font-medium transition-colors group"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsTrainingSubjectsOpen(false)
                    }}
                  >
                    <span className="group-hover:text-[#0A3049] transition-colors">{category}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A3049] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth is now a full page at /auth */}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

