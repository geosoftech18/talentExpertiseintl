'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: {
        websiteToken: string
        baseUrl: string
      }) => void
    }
  }
}

export default function ChatwootWidget() {
  useEffect(() => {
    // Only load Chatwoot on client side
    if (typeof window === 'undefined') return

    const BASE_URL = 'https://app.chatwoot.com'
    const WEBSITE_TOKEN = 'Qf8msJG7zGv85erZhQ7pjzir'

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="chatwoot"]')
    if (existingScript) {
      // Script already exists, wait a bit and initialize if SDK is available
      const initWidget = () => {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: WEBSITE_TOKEN,
            baseUrl: BASE_URL
          })
        } else {
          // Retry after a short delay if SDK not yet available
          setTimeout(initWidget, 100)
        }
      }
      initWidget()
      return
    }

    // Load Chatwoot script (matching the original pattern)
    const script = document.createElement('script')
    script.src = `${BASE_URL}/packs/js/sdk.js`
    script.async = true
    
    script.onload = () => {
      // Initialize Chatwoot widget once SDK is loaded
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: WEBSITE_TOKEN,
          baseUrl: BASE_URL
        })
      } else {
        // Retry initialization if SDK not immediately available
        const retryInit = setInterval(() => {
          if (window.chatwootSDK) {
            window.chatwootSDK.run({
              websiteToken: WEBSITE_TOKEN,
              baseUrl: BASE_URL
            })
            clearInterval(retryInit)
          }
        }, 100)
        
        // Stop retrying after 5 seconds
        setTimeout(() => clearInterval(retryInit), 5000)
      }
    }

    // Insert script before the first script tag (matching original pattern)
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.body.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount to prevent widget flickering
      // The script will remain loaded for the session
    }
  }, [])

  // This component doesn't render anything visible
  // Chatwoot handles the floating widget UI automatically
  return null
}

