"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

interface Highlight {
  icon: React.ReactNode
  label: string
  desc: string
}

interface Stat {
  value: string
  suffix?: string
  label: string
}

interface ValueItem {
  name: string
  desc: string
}

interface CTA {
  label: string
  href: string
  variant?: "primary" | "secondary"
}

interface GlassImageProps {
  imageUrl?: string
  imageUrls?: string[]
}

interface CompanyIntroProps {
  heading: string
  lead: string
  paragraphs: string[]
  highlights: Highlight[]
  stats: Stat[]
  values: {
    title: string
    items: ValueItem[]
  }
  ctas: CTA[]
  imageUrl?: string
  imageUrls?: string[]
  variant?: "split" | "centered" | "stackedEditorial"
  theme?: "lightTextOnDark" | "darkTextOnLight"
  founder?: {
    name: string
    designation: string
    message: string
    image: string
    socialLinks: {
      platform: string
      url: string
      icon: string
    }[]
  }
}

// Utility: Split text for animations
const splitText = (text: string) => {
  return text.split("").map((char, i) => ({
    char,
    id: i,
  }))
}

// Count-up animation component
const CountUpNumber: React.FC<{ value: string; suffix?: string }> = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const numericValue = Number.parseInt(value.replace(/[^0-9]/g, ""), 10)
    if (isNaN(numericValue)) return

    let current = 0
    const increment = Math.ceil(numericValue / 60)
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold">
      {displayValue.toLocaleString()}
      {suffix}
    </div>
  )
}

// Value card component with hover effects
const ValueCard: React.FC<{ item: ValueItem; index: number; theme?: "lightTextOnDark" | "darkTextOnLight" }> = ({ item, index, theme = "lightTextOnDark" }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const isDarkTheme = theme === "lightTextOnDark"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateX: 20 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: 20 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -12, rotateX: 5 }}
      onMouseMove={handleMouseMove}
      className={`group relative h-full overflow-hidden rounded-2xl ${
        isDarkTheme
          ? "bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-slate-600/30"
          : "bg-gradient-to-br from-blue-50/40 to-white/30 border border-gray-200/50"
      }`}
      style={{ perspective: "1000px" }}
    >
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 ${
          isDarkTheme
            ? "bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent"
            : "bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-transparent"
        }`}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Glassmorphism layer */}
      <div
        className={`absolute inset-0 backdrop-blur-xl rounded-2xl ${
          isDarkTheme
            ? "bg-white/5 border border-white/20"
            : "bg-white/60 border border-gray-200/40"
        }`}
      />

      {/* Interactive glow effect following mouse */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${
            isDarkTheme ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)"
          } 0%, transparent 50%)`,
        }}
      />

      {/* Floating gradient orb */}
      <motion.div
        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
          isDarkTheme
            ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/10"
            : "bg-gradient-to-br from-cyan-400/15 to-blue-400/8"
        }`}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 h-full p-8 md:p-10 flex flex-col justify-between">
        {/* Animated number badge */}
        <motion.div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-6 transition-all ${
            isDarkTheme
              ? "bg-gradient-to-br from-blue-500/30 to-purple-500/20 border-blue-400/40 group-hover:border-blue-300/60"
              : "bg-gradient-to-br from-blue-500/20 to-purple-500/15 border-blue-400/50 group-hover:border-blue-500/70"
          }`}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              isDarkTheme
                ? "0 0 0 0 rgba(59, 130, 246, 0)"
                : "0 0 0 0 rgba(59, 130, 246, 0)",
              isDarkTheme
                ? "0 0 20 10 rgba(59, 130, 246, 0.3)"
                : "0 0 20 10 rgba(59, 130, 246, 0.2)",
              isDarkTheme
                ? "0 0 0 0 rgba(59, 130, 246, 0)"
                : "0 0 0 0 rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
        >
          <span
            className={`text-lg font-bold bg-clip-text text-transparent ${
              isDarkTheme
                ? "bg-gradient-to-r from-blue-300 to-cyan-300"
                : "bg-gradient-to-r from-blue-600 to-cyan-600"
            }`}
          >
            {index + 1}
          </span>
        </motion.div>

        {/* Title with gradient text */}
        <div className="mb-4">
          <h3
            className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent transition-all duration-300 mb-3 ${
              isDarkTheme
                ? "bg-gradient-to-r from-white to-gray-200 group-hover:from-blue-200 group-hover:to-cyan-200"
                : "bg-gradient-to-r from-slate-900 to-slate-700 group-hover:from-blue-600 group-hover:to-cyan-600"
            }`}
          >
            {item.name}
          </h3>
          <motion.div
            className={`h-1 rounded-full ${
              isDarkTheme
                ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
            initial={{ width: 0 }}
            whileInView={{ width: "40px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          />
        </div>

        {/* Description text */}
        <p
          className={`text-sm leading-relaxed transition-colors duration-300 ${
            isDarkTheme
              ? "text-gray-300 group-hover:text-white"
              : "text-gray-700 group-hover:text-slate-900"
          }`}
        >
          {item.desc}
        </p>

        {/* Bottom accent line - animated on hover */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${
            isDarkTheme
              ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
              : "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"
          }`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}

const GlassImage: React.FC<GlassImageProps> = ({ imageUrl, imageUrls = [] }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Combine single image and multiple images
  const allImages = imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : []
  const displayImages = allImages.length > 0 ? allImages : ["/modern-office.png"]

  // Auto-rotate images
  useEffect(() => {
    if (!autoPlay || displayImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [autoPlay, displayImages.length])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
    setAutoPlay(false)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
    setAutoPlay(false)
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
    setAutoPlay(false)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
      className="relative h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden group"
    >
      {/* Glass morphism background layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl"
        animate={{
          background: [
            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
          ],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Image carousel container */}
      <div className="relative w-full h-full overflow-hidden">
        {displayImages.map((img, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
              <img
                src={img || "/placeholder.svg"}
                alt={`Company showcase ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating accent elements */}
      <motion.div
        className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-blue-400/40 to-purple-400/20 rounded-full blur-2xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        className="absolute bottom-6 left-6 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-blue-400/10 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
      />

      {/* Image counter and dots - visible on larger screens */}
      {displayImages.length > 1 && (
        <>
          {/* Navigation dots */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayImages.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => goToImage(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>

          {/* Arrow navigation buttons - hidden on mobile */}
          <motion.button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>

          <motion.button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>

          {/* Image counter */}
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        </>
      )}
    </motion.div>
  )
}

export const CompanyIntro: React.FC<CompanyIntroProps> = ({
  heading,
  lead,
  paragraphs,
  highlights,
  stats,
  values,
  ctas,
  imageUrl,
  imageUrls = [],
  variant = "split",
  theme = "darkTextOnLight",
  founder,
}) => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section
      ref={containerRef}
      className={`w-full py-16 md:py-24 lg:py-32 ${
        theme === "lightTextOnDark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* LEFT SECTION: Content with advanced styling */}
          <div className="flex flex-col justify-between relative">
            {/* Decorative gradient blobs */}
            <motion.div
              className={`absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
                theme === "lightTextOnDark"
                  ? "bg-gradient-to-br from-blue-600 to-purple-600"
                  : "bg-gradient-to-br from-blue-400 to-cyan-300"
              }`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
            />

            {/* Heading & Lead */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-12 relative z-10"
            >
              {lead && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className={`inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full backdrop-blur-md border ${
                    theme === "lightTextOnDark"
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-300"
                      : "bg-blue-400/10 border-blue-400/30 text-blue-600"
                  }`}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full ${theme === "lightTextOnDark" ? "bg-blue-400" : "bg-blue-500"}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider">{lead}</p>
                </motion.div>
              )}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6 relative">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className={`inline-block ${
                    theme === "lightTextOnDark"
                      ? "bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
                  }`}
                >
                  {heading}
                </motion.span>
              </h2>
            </motion.div>

            {/* Paragraphs with advanced styling */}
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12 relative z-10">
              {paragraphs.map((para, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className={`relative pl-4 border-l-2 ${
                    theme === "lightTextOnDark"
                      ? "border-blue-500/40 text-gray-300"
                      : "border-blue-400/40 text-gray-700"
                  }`}
                >
                  <p className="text-base md:text-lg leading-relaxed">{para}</p>
                </motion.div>
              ))}
            </div>

            {/* CTAs with advanced interactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-4 relative z-10"
            >
              {ctas.map((cta, i) => (
                <motion.a
                  key={i}
                  href={cta.href}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative group px-6 md:px-8 py-3 rounded-lg font-semibold transition-all overflow-hidden ${
                    cta.variant === "primary"
                      ? `${
                          theme === "lightTextOnDark"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/50"
                        }`
                      : `${
                          theme === "lightTextOnDark"
                            ? "border border-blue-500/50 text-blue-300 hover:bg-slate-700/50 hover:border-blue-400"
                            : "border border-blue-400/50 text-blue-600 hover:bg-blue-50/50 hover:border-blue-500"
                        }`
                  }`}
                >
                  <motion.div
                    className={`absolute inset-0 ${
                      theme === "lightTextOnDark"
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        : "bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                    }`}
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative flex items-center gap-2">
                    {cta.label}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* RIGHT SECTION: Enhanced responsive image gallery */}
          <div className="hidden lg:block">
            <GlassImage imageUrl={imageUrl} imageUrls={imageUrls} />
          </div>

          {/* Mobile/Tablet image section */}
          <div className="lg:hidden">
            <GlassImage imageUrl={imageUrl} imageUrls={imageUrls} />
          </div>
        </div>
      </div>

      {/* Founder Message Section */}
      {founder && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`mt-24 md:mt-32 relative overflow-hidden ${
            theme === "lightTextOnDark"
              ? "bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900/80"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
          }`}
        >
          {/* Background animated elements */}
          <motion.div
            className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none ${
              theme === "lightTextOnDark"
                ? "bg-gradient-to-br from-blue-600/40 to-purple-600/40"
                : "bg-gradient-to-br from-blue-400/20 to-purple-400/20"
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          />

          <motion.div
            className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
              theme === "lightTextOnDark"
                ? "bg-gradient-to-br from-cyan-600/30 to-blue-600/30"
                : "bg-gradient-to-br from-cyan-400/20 to-blue-400/15"
            }`}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
          />

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* LEFT: Founder Image with Glass Morphism */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex justify-center lg:justify-start"
              >
                <div className="relative w-full max-w-sm">
                  {/* Glass morphism container */}
                  <motion.div
                    className={`relative rounded-2xl overflow-hidden group border ${
                      theme === "lightTextOnDark" ? "border-white/20 bg-white/10" : "border-gray-200/50 bg-white/40"
                    } backdrop-blur-xl`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated gradient overlay */}
                    <motion.div
                      className={`absolute inset-0 ${
                        theme === "lightTextOnDark"
                          ? "bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"
                          : "bg-gradient-to-br from-blue-400/15 via-purple-400/8 to-transparent"
                      }`}
                      animate={{
                        background: [
                          theme === "lightTextOnDark"
                            ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)",
                          theme === "lightTextOnDark"
                            ? "linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(147, 51, 234, 0.15) 100%)"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)",
                          theme === "lightTextOnDark"
                            ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)",
                        ],
                      }}
                      transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
                    />

                    {/* Image */}
                    <motion.img
                      src={founder.image || "/placeholder.svg?height=600&width=400&query=founder portrait"}
                      alt={founder.name}
                      className="w-full h-auto object-cover relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Floating gradient orbs */}
                    <motion.div
                      className={`absolute top-6 right-6 w-24 h-24 rounded-full blur-2xl ${
                        theme === "lightTextOnDark"
                          ? "bg-gradient-to-br from-blue-500/40 to-cyan-500/20"
                          : "bg-gradient-to-br from-blue-400/30 to-cyan-400/15"
                      }`}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                    />

                    <motion.div
                      className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl ${
                        theme === "lightTextOnDark"
                          ? "bg-gradient-to-br from-purple-600/30 to-blue-600/20"
                          : "bg-gradient-to-br from-purple-400/20 to-blue-400/15"
                      }`}
                      animate={{
                        y: [0, 15, 0],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* RIGHT: Founder Info & Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col space-y-8"
              >
                {/* Founder Name & Designation */}
                <div className="space-y-3">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className={`text-3xl md:text-4xl font-bold ${
                      theme === "lightTextOnDark"
                        ? "bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
                        : "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                    }`}
                  >
                    {founder.name}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className={`text-lg font-semibold ${
                      theme === "lightTextOnDark" ? "text-blue-400/90" : "text-blue-600/90"
                    }`}
                  >
                    {founder.designation}
                  </motion.p>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60px" }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className={`h-1 rounded-full ${
                      theme === "lightTextOnDark"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                  />
                </div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className={`space-y-4 ${theme === "lightTextOnDark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  {founder.message.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-base md:text-lg leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  {founder.socialLinks.map((link, i) => (
                    <motion.a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                        theme === "lightTextOnDark"
                          ? "bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 hover:border-blue-400/60"
                          : "bg-blue-500/10 border border-blue-400/40 hover:bg-blue-500/20 hover:border-blue-500/60"
                      }`}
                    >
                      {/* Hover glow */}
                      <motion.div
                        className={`absolute inset-0 rounded-full ${
                          theme === "lightTextOnDark"
                            ? "bg-gradient-to-br from-blue-500/30 to-purple-500/20"
                            : "bg-gradient-to-br from-blue-400/20 to-purple-400/10"
                        }`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                      />

                      <span className="text-lg relative z-10">{link.icon}</span>
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Highlights Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 md:mt-28"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-xl p-6 md:p-8 transition-all duration-300 ${
                  theme === "lightTextOnDark"
                    ? "bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-slate-600/30 hover:border-blue-500/50"
                    : "bg-gradient-to-br from-blue-50/40 to-white/30 border border-gray-200/50 hover:border-blue-400/50"
                }`}
              >
                <div
                  className={`absolute inset-0 ${
                    theme === "lightTextOnDark"
                      ? "bg-gradient-to-br from-blue-600/5 to-purple-600/5"
                      : "bg-gradient-to-br from-blue-400/30 to-purple-400/20"
                  } backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <motion.div
                  className={`relative mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl ${
                    theme === "lightTextOnDark"
                      ? "bg-gradient-to-br from-blue-600/30 to-purple-600/20 border border-blue-500/30"
                      : "bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-400/30"
                  } group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-2xl relative z-10">{highlight.icon}</div>

                  <motion.div
                    className={`absolute inset-0 rounded-xl ${
                      theme === "lightTextOnDark"
                        ? "bg-gradient-to-br from-blue-500/40 to-purple-500/30"
                        : "bg-gradient-to-br from-blue-400/30 to-purple-400/20"
                    }`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                    }}
                  />
                </motion.div>

                <h3 className="relative z-10 font-bold text-lg md:text-xl mb-2 text-foreground">{highlight.label}</h3>
                <p
                  className={`relative z-10 text-sm leading-relaxed ${
                    theme === "lightTextOnDark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {highlight.desc}
                </p>

                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${
                    theme === "lightTextOnDark"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`rounded-lg p-12 md:p-16 mt-20 md:mt-28 mx-4 md:mx-6 lg:mx-8 ${
          theme === "lightTextOnDark"
            ? "bg-gradient-to-r from-slate-800 to-slate-700"
            : "bg-gradient-to-r from-gray-100 to-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <CountUpNumber value={stat.value} suffix={stat.suffix} />
                <p
                  className={`text-sm mt-2 font-medium ${
                    theme === "lightTextOnDark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 md:mt-32 relative overflow-hidden"
      >
        {/* Background animated gradient circles */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Section heading with advanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-widest text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-4"
            >
              Our Core Principles
            </motion.p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className={`inline-block bg-clip-text text-transparent ${
                  theme === "lightTextOnDark"
                    ? "bg-gradient-to-r from-white via-blue-100 to-white"
                    : "bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900"
                }`}
              >
                {values.title}
              </motion.span>
            </h2>
          </motion.div>

          {/* Values grid with staggered animation */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.items.map((item, i) => (
              <ValueCard key={i} item={item} index={i} theme={theme} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
