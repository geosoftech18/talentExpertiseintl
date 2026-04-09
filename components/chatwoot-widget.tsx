'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>
    Tawk_LoadStart?: Date
  }
}

export default function ChatwootWidget() {
  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') return

    const propertyId = '667a5ddaeaf3bd8d4d141600'
    const widgetId = '1i214b5ql'

    // Keep flow safe if Tawk config is not set
    if (!propertyId) {
      console.warn('Tawk.to is not configured. Set NEXT_PUBLIC_TAWK_PROPERTY_ID.')
      return
    }

    // Avoid duplicate injection
    const src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) return

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.setAttribute('crossorigin', '*')

    // Insert script before first script tag
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.body.appendChild(script)
    }

    // Keep script loaded for session to avoid widget flicker
    return () => {}
  }, [])

  // Tawk.to handles floating widget UI automatically
  return null
}

