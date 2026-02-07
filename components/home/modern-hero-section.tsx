"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, GraduationCap, Sparkles, Users, Globe, Award, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ModernHeroSection() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingIcons = [
    { icon: GraduationCap, delay: 0, x: 10, y: 20 },
    { icon: Users, delay: 0.5, x: 85, y: 15 },
    { icon: Globe, delay: 1, x: 15, y: 75 },
    { icon: Award, delay: 1.5, x: 80, y: 70 },
    { icon: TrendingUp, delay: 2, x: 50, y: 10 },
  ]

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background - Using website colors */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#0A3049] via-[#0A3049] to-[#0a3d5c]"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0A3049 0%, #0a3d5c 100%)
          `
        }}
      >
        {/* Animated mesh overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_70%)] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Floating Icons Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => {
          const IconComponent = item.icon
          return (
            <div
              key={index}
              className="absolute w-16 h-16 text-white/10 animate-float"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${4 + index * 0.5}s`,
              }}
            >
              <IconComponent className="w-full h-full" />
            </div>
          )
        })}
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#06b6d4]/40 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content - Constrained Width */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge with animation */}
          <div className={`flex justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30 backdrop-blur-sm px-4 py-1.5 hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-3 h-3 mr-2 animate-pulse" />
              World-Class Training Since 1983
            </Badge>
          </div>

          {/* Main Heading with staggered animation */}
          <div className={`space-y-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              <span className="block">Transform Your</span>
              <span className="block bg-gradient-to-r from-white via-[#06b6d4] to-white bg-clip-text text-transparent animate-gradient">
                Professional Future
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Exceptional provider of world-class training, coaching & consulting services across 70+ global cities.
            </p>
          </div>

          {/* CTA Buttons with hover animations */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Button
              size="lg"
              className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white font-semibold px-8 py-6 text-base group shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/public-program')}
            >
              Explore Courses
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white bg-white/10 hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/contact')}
            >
              Get Started
            </Button>
          </div>

          {/* Stats with staggered animation */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-12 border-t border-white/10 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { value: "200+", label: "Expert Consultants" },
              { value: "40+", label: "Global Cities" },
              { value: "30+", label: "Years Experience" },
              { value: "50K+", label: "Professionals Trained" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-110 transition-transform duration-300"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-[#06b6d4] transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A3049] to-transparent pointer-events-none" />

      {/* Scroll Indicator with animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 hover:border-white/50 transition-colors">
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-scroll" />
        </div>
      </div>
    </div>
  )
}
