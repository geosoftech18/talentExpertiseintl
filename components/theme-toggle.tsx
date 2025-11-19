"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setIsAnimating(true)
    setTheme(theme === "dark" ? "light" : "dark")
    setTimeout(() => setIsAnimating(false), 300)
  }

  if (!mounted) {
    return (
      <div className="w-14 h-7 bg-muted rounded-full animate-pulse" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={handleToggle}
      className={`
        relative w-14 h-7 rounded-full transition-all duration-500 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        ${isDark 
          ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 focus:ring-cyan-500' 
          : 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 focus:ring-orange-500'
        }
        shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95
        ${isAnimating ? 'animate-pulse' : ''}
        overflow-hidden
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated background shimmer effect */}
      <div 
        className={`
          absolute inset-0 rounded-full opacity-30
          bg-gradient-to-r from-transparent via-white to-transparent
          transform -skew-x-12 transition-transform duration-1000
          ${isAnimating ? 'translate-x-full' : '-translate-x-full'}
        `}
      />
      
      {/* Toggle Circle with enhanced styling */}
      <div
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg
          transition-all duration-500 ease-in-out transform
          ${isDark ? 'translate-x-7 rotate-360' : 'translate-x-0 rotate-0'}
          flex items-center justify-center
          group-hover:scale-110
        `}
      >
        {/* Icon with rotation animation */}
        <div 
          className={`
            transition-all duration-500 ease-in-out
            ${isDark ? 'rotate-0 scale-100' : 'rotate-180 scale-100'}
          `}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5  text-orange-500 transition-colors duration-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-cyan-500  transition-colors duration-300" />
          )}
        </div>
        
        {/* Glowing effect inside circle */}
        <div 
          className={`
            absolute inset-0 rounded-full opacity-20
            ${isDark ? 'bg-cyan-400' : 'bg-orange-400'}
            blur-sm
          `}
        />
      </div>
      
      {/* Stars/particles effect for dark mode */}
      {isDark && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
      
      {/* Sun rays effect for light mode */}
      {!isDark && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white rounded-full opacity-60 transform -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white rounded-full opacity-60 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-white rounded-full opacity-60 transform -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-white rounded-full opacity-60 transform -translate-y-1/2" />
        </div>
      )}
      
      {/* Background gradient overlay for smooth transition */}
      <div
        className={`
          absolute inset-0 rounded-full transition-opacity duration-500 ease-in-out pointer-events-none
          ${isDark 
            ? 'opacity-100' 
            : 'opacity-0'
          }
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(14, 165, 233, 0.8) 50%, rgba(20, 184, 166, 0.8) 100%)'
        }}
      />
      
      {/* Light mode gradient overlay */}
      <div
        className={`
          absolute inset-0 rounded-full transition-opacity duration-500 ease-in-out pointer-events-none
          ${!isDark 
            ? 'opacity-100' 
            : 'opacity-0'
          }
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(249, 115, 22, 0.8) 50%, rgba(239, 68, 68, 0.8) 100%)'
        }}
      />
    </button>
  )
}
