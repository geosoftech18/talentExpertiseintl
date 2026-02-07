'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { CourseRegistrationForm } from '@/components/course-registration-form'
import type { Course, CourseSchedule } from '@/lib/supabase'
import { Loader2, UserPlus, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CourseCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const slug = params?.slug as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  
  // Auth form state
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [signupStep, setSignupStep] = useState(true)
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({})
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'linkedin' | null>(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!slug) {
        setError('Course slug is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch course details with schedules
        const response = await fetch(`/api/courses/${slug}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load course details')
        }

        const courseData = result.data.course as Course
        const schedulesData = (result.data.schedules || []) as CourseSchedule[]

        console.log('Fetched schedules:', schedulesData)
        console.log('Schedules count:', schedulesData.length)

        setCourse(courseData)
        setSchedules(schedulesData)

        // Get scheduleId from URL params if provided
        const scheduleIdParam = searchParams.get('scheduleId')
        if (scheduleIdParam && schedulesData.find(s => s.id === scheduleIdParam)) {
          setSelectedScheduleId(scheduleIdParam)
        } else if (schedulesData.length > 0) {
          // Default to first schedule if none specified
          setSelectedScheduleId(schedulesData[0].id)
        }
      } catch (err) {
        console.error('Error fetching course data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [slug, searchParams])

  // If user is authenticated, skip signup and go to registration
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setSignupStep(false)
      setSocialLoading(null)
      
      // Ensure scheduleId is set from URL params after OAuth redirect
      if (!selectedScheduleId && searchParams.get('scheduleId')) {
        const scheduleIdParam = searchParams.get('scheduleId')
        if (schedules.length > 0 && schedules.find(s => s.id === scheduleIdParam)) {
          setSelectedScheduleId(scheduleIdParam)
        } else if (schedules.length > 0) {
          // If the scheduleId from URL doesn't match, use first available
          setSelectedScheduleId(schedules[0].id)
        }
      } else if (!selectedScheduleId && schedules.length > 0) {
        // If no scheduleId in URL, use first available
        setSelectedScheduleId(schedules[0].id)
      }
    }
  }, [status, session, schedules, selectedScheduleId, searchParams])

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!signupData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!signupData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!signupData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!signupData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setAuthErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setAuthErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignupForm()) {
      return
    }

    setIsSigningUp(true)
    setAuthErrors({})

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthErrors({ submit: data.error || 'Failed to create account' })
        setIsSigningUp(false)
        return
      }

      // Automatically log in after signup
      const loginResult = await signIn('credentials', {
        email: signupData.email,
        password: signupData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        setAuthErrors({ submit: 'Account created but login failed. Please try logging in manually.' })
        setIsSigningUp(false)
        return
      }

      // Success - move to registration form
      setSignupStep(false)
      // Refresh session to get updated user data
      window.location.reload()
    } catch (error) {
      console.error('Signup error:', error)
      setAuthErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) {
      return
    }

    setIsLoggingIn(true)
    setAuthErrors({})

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthErrors({ submit: 'Invalid email or password' })
        setIsLoggingIn(false)
        return
      }

      // Success - move to registration form
      setSignupStep(false)
      // Refresh session to get updated user data
      window.location.reload()
    } catch (error) {
      console.error('Login error:', error)
      setAuthErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'linkedin') => {
    if (isSigningUp || isLoggingIn || socialLoading !== null) return
    
    setSocialLoading(provider)
    setAuthErrors({})

    try {
      // Get current checkout URL as callback
      const scheduleIdParam = searchParams.get('scheduleId')
      const callbackUrl = `/courses/${slug}/checkout${scheduleIdParam ? `?scheduleId=${scheduleIdParam}` : ''}`
      const fullCallbackUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${callbackUrl}`
        : callbackUrl

      await signIn(provider, {
        callbackUrl: fullCallbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error(`${provider} auth error:`, error)
      setAuthErrors({ submit: `Failed to sign in with ${provider}. Please try again.` })
      setSocialLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Course</h2>
            <p className="text-red-700 mb-4">{error || 'Course not found'}</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show signup form if not authenticated
  if (signupStep && status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Course Info Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#0A3049] mb-2">{course.title}</h1>
            {course.course_code && (
              <p className="text-slate-600">Course Code: {course.course_code}</p>
            )}
          </div>

          {/* Auth Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  {isLoginMode ? (
                    <LogIn className="w-6 h-6 text-blue-600" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <CardTitle className="text-2xl font-bold text-[#0A3049]">
                  {isLoginMode ? 'Login to Register' : 'Create Account to Register'}
                </CardTitle>
              </div>
              <p className="text-slate-600 mt-2">
                {isLoginMode 
                  ? 'Login to your account to proceed with course registration'
                  : 'Create your account to proceed with course registration'}
              </p>
            </CardHeader>
            <CardContent>
              {/* OAuth Buttons */}
              <div className="flex gap-4 mb-6 justify-center">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isSigningUp || isLoggingIn || socialLoading !== null}
                  className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('linkedin')}
                  disabled={isSigningUp || isLoggingIn || socialLoading !== null}
                  className="w-14 h-14 border-2 border-slate-200 rounded-full hover:border-slate-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'linkedin' ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-6 h-6" fill="#0077B5" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                </button>
              </div>

              <p className="text-center text-slate-500 text-sm mb-6">
                or use your email {isLoginMode ? 'to login' : 'for registration'}
              </p>

              {isLoginMode ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email *</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={authErrors.email ? 'border-red-500' : ''}
                      required
                    />
                    {authErrors.email && (
                      <p className="text-xs text-red-600">{authErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password *</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={authErrors.password ? 'border-red-500' : ''}
                      required
                    />
                    {authErrors.password && (
                      <p className="text-xs text-red-600">{authErrors.password}</p>
                    )}
                  </div>

                  {authErrors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{authErrors.submit}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-600">
                      Your information is secure and will only be used for course registration
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoggingIn || socialLoading !== null}
                    className="w-full bg-[#0A3049] hover:bg-[#0A3049]/90 text-white font-semibold h-12"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login & Continue
                        <Lock className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-slate-600 text-sm">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMode(false)
                          setAuthErrors({})
                        }}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Create account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className={authErrors.firstName ? 'border-red-500' : ''}
                        required
                      />
                      {authErrors.firstName && (
                        <p className="text-xs text-red-600">{authErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className={authErrors.lastName ? 'border-red-500' : ''}
                        required
                      />
                      {authErrors.lastName && (
                        <p className="text-xs text-red-600">{authErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className={authErrors.email ? 'border-red-500' : ''}
                      required
                    />
                    {authErrors.email && (
                      <p className="text-xs text-red-600">{authErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className={authErrors.password ? 'border-red-500' : ''}
                      required
                    />
                    {authErrors.password && (
                      <p className="text-xs text-red-600">{authErrors.password}</p>
                    )}
                    <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className={authErrors.confirmPassword ? 'border-red-500' : ''}
                      required
                    />
                    {authErrors.confirmPassword && (
                      <p className="text-xs text-red-600">{authErrors.confirmPassword}</p>
                    )}
                  </div>

                  {authErrors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{authErrors.submit}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-600">
                      Your information is secure and will only be used for course registration
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSigningUp || socialLoading !== null}
                    className="w-full bg-[#0A3049] hover:bg-[#0A3049]/90 text-white font-semibold h-12"
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account & Continue
                        <Lock className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-slate-600 text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMode(true)
                          setAuthErrors({})
                        }}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show registration form (user is authenticated or just signed up)
  // Only show if course is loaded (schedules can be empty, that's okay)
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading course schedules...</p>
        </div>
      </div>
    )
  }

  console.log('Rendering registration form with schedules:', schedules)
  console.log('Selected schedule ID:', selectedScheduleId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <CourseRegistrationForm
        course={course}
        schedules={schedules || []}
        selectedScheduleId={selectedScheduleId || schedules[0]?.id || null}
        onClose={() => router.push(`/courses/${slug}`)}
      />
    </div>
  )
}

