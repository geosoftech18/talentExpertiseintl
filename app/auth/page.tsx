"use client"

import { Suspense } from "react"
import DoubleSliderAuthForm from "@/components/auth/double-slider-auth-form"

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DoubleSliderAuthForm />
    </Suspense>
  )
}

