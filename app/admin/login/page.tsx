"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Mail, 
  Shield, 
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check if already authenticated
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check')
      const data = await response.json()
      if (data.authenticated) {
        router.push('/admin')
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Verification code sent to your email!')
        setStep('otp')
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // InputOTP returns the value as a string, ensure it's exactly 6 digits
    const trimmedOtp = otp.replace(/\s/g, '').trim() // Remove all whitespace
    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    console.log('[Frontend] Verifying OTP:', { 
      email: email.trim().toLowerCase(), 
      code: trimmedOtp, 
      codeLength: trimmedOtp.length,
      rawOtp: otp,
      isNumeric: /^\d{6}$/.test(trimmedOtp)
    })

    // Debug: Check OTP store before verification
    try {
      const debugResponse = await fetch('/api/admin/auth/debug')
      const debugData = await debugResponse.json()
      console.log('[Frontend] OTP Store State:', debugData)
    } catch (err) {
      console.error('[Frontend] Failed to get debug info:', err)
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code: trimmedOtp 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        setError(data.error || 'Invalid verification code')
        setOtp('')
      }
    } catch (error) {
      console.error('[Frontend] Verification error:', error)
      setError('Something went wrong. Please try again.')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('New verification code sent!')
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'email' 
              ? 'Enter your email to receive a verification code'
              : 'Enter the 6-digit code sent to your email'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-center block">
                  Enter Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup className="gap-3">
                      <InputOTPSlot 
                        index={0} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                      <InputOTPSlot 
                        index={1} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                      <InputOTPSlot 
                        index={2} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                      <InputOTPSlot 
                        index={3} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                      <InputOTPSlot 
                        index={4} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                      <InputOTPSlot 
                        index={5} 
                        className="!border-2 !border-purple-300 dark:!border-purple-600 !bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !font-bold !text-lg !h-10 !w-10 rounded-lg shadow-md data-[active=true]:!border-purple-600 dark:data-[active=true]:!border-purple-400 data-[active=true]:!ring-2 data-[active=true]:!ring-purple-200 dark:data-[active=true]:!ring-purple-800"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Code sent to <span className="font-medium">{email}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
                
                {/* <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                    setSuccess('')
                  }}
                  disabled={isLoading}
                >
                  Change Email
                </Button> */}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

