"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export type TextAnimationType =
  | "fade"
  | "rise"
  | "mask"
  | "letter-stagger"
  | "word-stagger"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "typing"
export type SlideInType = "fade" | "slide-left" | "slide-right" | "slide-up" | "slide-down" | "kenburns"
export type AspectRatioType = "16/9" | "3/1" | "full"
export type ContentAlignType = "left" | "center" | "right"
export type ContentVAlignType = "top" | "center" | "bottom"
export type IndicatorVariantType = "dots" | "progress" | "fraction"
export type ArrowVariantType = "solid" | "ghost" | "glass"
export type ThemeType = "lightTextOnDark" | "darkTextOnLight"
export type ReducedMotionFallbackType = "fadeOnly" | "noAutoPlay"
export type CTAVariantType = "primarySecondary" | "ghostOnly"

export interface CTA {
  label: string
  href: string
  target?: string
  variant?: "primary" | "secondary" | "ghost"
}

export interface KPI {
  label: string
  value: string
}

export interface SlideOverlay {
  from?: string
  via?: string
  to?: string
  direction?: "tl" | "tr" | "bl" | "br"
}

export interface Slide {
  id: string
  eyebrow?: string
  heading: string
  subheading?: string
  ctas?: CTA[]
  image: {
    src: string
    alt: string
    priority?: boolean
    placeholder?: "blur" | "empty"
  }
  overlay?: SlideOverlay
  badges?: string[]
  kpis?: KPI[]
}

export interface AnimationConfig {
  transition?: { duration?: number; ease?: string }
  slideIn?: SlideInType
  kenBurns?: { scaleFrom?: number; scaleTo?: number }
  parallax?: { enabled?: boolean; strength?: number }
  text?: {
    eyebrow?: { type?: TextAnimationType; delay?: number }
    heading?: {
      type?: TextAnimationType
      delay?: number
      letterStagger?: number
      wordStagger?: number
    }
    subheading?: { type?: TextAnimationType; delay?: number }
    ctas?: { type?: TextAnimationType; delay?: number }
  }
  dots?: { activeScale?: number }
  arrows?: { hoverNudgePx?: number; pressScale?: number }
}

export interface HeroSliderProps {
  slides: Slide[]
  autoPlay?: {
    enabled?: boolean
    delayMs?: number
    pauseOnHover?: boolean
    pauseOnFocus?: boolean
  }
  loop?: boolean
  startIndex?: number
  showArrows?: boolean
  showDots?: boolean
  aspectRatio?: AspectRatioType
  contentAlign?: ContentAlignType
  contentVAlign?: ContentVAlignType
  maxWidth?: string
  paddingX?: string
  heightClass?: string
  gradientOverlay?: {
    enabled?: boolean
    from?: string
    via?: string
    to?: string
    direction?: "tl" | "tr" | "bl" | "br"
  }
  imageMode?: "image" | "next-image"
  indicatorsVariant?: IndicatorVariantType
  arrowVariant?: ArrowVariantType
  theme?: ThemeType
  reducedMotionFallback?: ReducedMotionFallbackType
  captions?: {
    showEyebrow?: boolean
    showHeading?: boolean
    showSubheading?: boolean
  }
  ctaVariant?: CTAVariantType
  shadow?: "none" | "sm" | "md" | "xl"
  rounded?: "none" | "2xl" | "full"
  className?: string
  animations?: AnimationConfig
}

export interface HeroSliderHandle {
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  play: () => void
  pause: () => void
  isPlaying: () => boolean
}

const getGradientDirection = (direction?: "tl" | "tr" | "bl" | "br") => {
  switch (direction) {
    case "tr":
      return "to top right"
    case "bl":
      return "to bottom left"
    case "tl":
      return "to top left"
    case "br":
    default:
      return "to bottom right"
  }
}

// Convert Tailwind color format to rgba
const convertColorToRgba = (color: string | undefined, defaultOpacity: number = 0.8): string => {
  if (!color) return `rgba(0,0,0,${defaultOpacity})`
  
  // Handle transparent
  if (color === "transparent") return "rgba(0,0,0,0)"
  
  // Handle Tailwind format like "black/80", "blue-900/70", etc.
  const match = color.match(/^([a-z]+(?:-[0-9]+)?)\/([0-9]+)$/)
  if (match) {
    const [, colorName, opacity] = match
    const opacityNum = parseInt(opacity) / 100
    
    // Map common Tailwind colors to rgba
    const colorMap: Record<string, string> = {
      black: "0,0,0",
      white: "255,255,255",
      "blue-900": "30,58,138",
      "blue-800": "30,64,175",
      "blue-700": "29,78,216",
      "blue-600": "37,99,235",
      "purple-900": "88,28,135",
      "purple-800": "107,33,168",
      "purple-700": "126,34,206",
      "purple-600": "147,51,234",
      "slate-900": "15,23,42",
      "slate-800": "30,41,59",
    }
    
    const rgb = colorMap[colorName] || colorMap["black"]
    return `rgba(${rgb},${opacityNum})`
  }
  
  // Handle simple color names without opacity (default to high opacity for visibility)
  if (color === "black") return `rgba(0,0,0,${defaultOpacity})`
  if (color === "white") return `rgba(255,255,255,${defaultOpacity})`
  
  // If it's already rgba format, return as is
  if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
    return color
  }
  
  // Default fallback - use black with default opacity
  return `rgba(0,0,0,${defaultOpacity})`
}

const splitText = (text: string): string[] => text.split(" ")
const splitLetters = (text: string): string[] => text.split("")

const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return prefersReducedMotion
}

const TypingAnimation = ({
  text,
  delay = 0,
  speed = 0.02,
  className,
}: {
  text: string
  delay?: number
  speed?: number
  className?: string
}) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let currentIndex = 0

    const typeCharacter = () => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex))
        if (currentIndex === text.length) {
          setIsComplete(true)
        }
        currentIndex++
        timeoutId = setTimeout(typeCharacter, speed * 1000)
      }
    }

    timeoutId = setTimeout(typeCharacter, delay * 1000)

    return () => clearTimeout(timeoutId)
  }, [text, delay, speed])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-full ml-1 bg-current opacity-80"
          animate={{ opacity: [0.8, 0.2] }}
          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
        />
      )}
    </span>
  )
}

const CountUpAnimation = ({
  value,
  delay = 0,
  duration = 2,
  className,
}: {
  value: string | number
  delay?: number
  duration?: number
  className?: string
}) => {
  const [displayValue, setDisplayValue] = useState("0")

  // Extract numeric part and suffix (e.g., "1M" -> 1000000, "M")
  const parseValue = (val: string | number) => {
    const str = String(val)
    const match = str.match(/^([\d.]+)([KMB%]*)/i)
    if (!match) return { number: 0, suffix: "" }

    let number = Number.parseFloat(match[1])
    const suffix = match[2]

    // Convert suffixes to actual numbers
    if (suffix.toUpperCase() === "K") number *= 1000
    else if (suffix.toUpperCase() === "M") number *= 1000000
    else if (suffix.toUpperCase() === "B") number *= 1000000000

    return { number, suffix, original: str }
  }

  const { number: targetNumber, suffix, original } = parseValue(value)

  useEffect(() => {
    const startValue = 0
    let startTime: number
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = (currentTime - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      const current = Math.floor(startValue + (targetNumber - startValue) * progress)

      // Format the number back with suffix
      if (suffix) {
        const divisor = suffix.toUpperCase() === "K" ? 1000 : suffix.toUpperCase() === "M" ? 1000000 : 1000000000
        setDisplayValue(`${(current / divisor).toFixed(1)}${suffix}`)
      } else if (original && original.includes("%")) {
        setDisplayValue(`${current}%`)
      } else {
        setDisplayValue(current.toLocaleString())
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationId)
    }
  }, [targetNumber, suffix, duration, delay, original])

  return <span className={className}>{displayValue}</span>
}

const AnimatedText = ({
  text,
  type,
  delay,
  letterStagger,
  wordStagger,
  className,
  prefersReducedMotion,
  typingSpeed,
}: {
  text: string
  type?: TextAnimationType
  delay?: number
  letterStagger?: number
  wordStagger?: number
  className?: string
  prefersReducedMotion?: boolean
  typingSpeed?: number
}) => {
  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  if (type === "typing") {
    return <TypingAnimation text={text} delay={delay || 0} speed={typingSpeed || 0.03} className={className} />
  }

  if (type === "letter-stagger") {
    const letters = splitLetters(text)
    return (
      <span className={className}>
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (delay || 0) + i * (letterStagger || 0.02),
              duration: 0.5,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    )
  }

  if (type === "word-stagger") {
    const words = splitText(text)
    return (
      <span className={className}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (delay || 0) + i * (wordStagger || 0.06),
              duration: 0.5,
            }}
          >
            {word}
            {i < words.length - 1 && " "}
          </motion.span>
        ))}
      </span>
    )
  }

  if (type === "mask") {
    return (
      <motion.span
        className={className}
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "0% 100%" }}
        transition={{ delay: delay || 0, duration: 0.8 }}
      >
        {text}
      </motion.span>
    )
  }

  if (type === "rise") {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay || 0, duration: 0.6 }}
      >
        {text}
      </motion.span>
    )
  }

  if (type === "slide-up") {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay || 0, duration: 0.6 }}
      >
        {text}
      </motion.span>
    )
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay || 0, duration: 0.6 }}
    >
      {text}
    </motion.span>
  )
}

const ColorSwipeButton = ({
  href,
  target,
  label,
  variant,
  themeClass,
}: {
  href: string
  target?: string
  label: string
  variant?: "primary" | "secondary" | "ghost"
  themeClass: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)

  // Color palette for smooth cycling through complementary colors
  const colorPalettes = [
    {
      primary: { bg: "bg-blue-600", text: "text-white", fontWeight: "font-bold" },
      secondary: { bg: "bg-white/20", text: "text-white", border: "border-white/50", fontWeight: "font-semibold" },
      ghost: { bg: "bg-transparent", text: "text-white", border: "border-white/70", fontWeight: "font-semibold" },
    },
    {
      primary: { bg: "bg-blue-500", text: "text-white", fontWeight: "font-bold" },
      secondary: { bg: "bg-blue-500/90", text: "text-white", border: "border-blue-400/50", fontWeight: "font-semibold" },
      ghost: { bg: "bg-transparent", text: "text-white", border: "border-blue-300/70", fontWeight: "font-semibold" },
    },
    {
      primary: { bg: "bg-emerald-500", text: "text-white", fontWeight: "font-bold" },
      secondary: { bg: "bg-emerald-500/90", text: "text-white", border: "border-emerald-400/50", fontWeight: "font-semibold" },
      ghost: { bg: "bg-transparent", text: "text-white", border: "border-emerald-300/70", fontWeight: "font-semibold" },
    },
    {
      primary: { bg: "bg-amber-500", text: "text-white", fontWeight: "font-bold" },
      secondary: { bg: "bg-amber-500/90", text: "text-white", border: "border-amber-400/50", fontWeight: "font-semibold" },
      ghost: { bg: "bg-transparent", text: "text-white", border: "border-amber-300/70", fontWeight: "font-semibold" },
    },
  ]

  const currentPalette = colorPalettes[colorIndex]
  const nextPalette = colorPalettes[(colorIndex + 1) % colorPalettes.length]
  const buttonVariant = variant || "primary"
  const current = currentPalette[buttonVariant as keyof typeof currentPalette]

  const handleClick = () => {
    setColorIndex((prev) => (prev + 1) % colorPalettes.length)
  }

  return (
    <motion.div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative">
      <motion.a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`relative px-6 py-3 rounded-2xl transition-colors flex items-center gap-2 overflow-hidden group shadow-lg ${
          "fontWeight" in current ? current.fontWeight : "font-semibold"
        }`}
        style={{
          backgroundColor: current.bg === "bg-transparent" ? "transparent" : undefined,
          color: current.text,
          borderColor: "border" in current ? current.border : undefined,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl backdrop-blur-sm"
          initial={{ x: "100%" }}
          animate={colorIndex > 0 ? { x: 0 } : { x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            backgroundColor: nextPalette[buttonVariant as keyof typeof nextPalette]?.bg || "transparent",
            pointerEvents: "none",
          }}
        />

        <motion.span
          key={colorIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 font-semibold drop-shadow-sm"
          style={{
            color: current.text,
          }}
        >
          {label}
        </motion.span>

        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-white/0 to-white/60 rounded-full"
          initial={{ width: 0 }}
          animate={isHovered ? { width: "100%" } : { width: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {buttonVariant !== "primary" && (
          <motion.div
            className="absolute inset-0 rounded-2xl border pointer-events-none"
            animate={{
              borderColor: ("border" in current ? current.border : undefined) || "transparent",
            }}
            transition={{ duration: 0.4 }}
            style={{
              borderWidth: "1px",
            }}
          />
        )}
      </motion.a>
    </motion.div>
  )
}

const HeroSlider = forwardRef<HeroSliderHandle, HeroSliderProps>(
  (
    {
      slides,
      autoPlay = { enabled: true, delayMs: 5000, pauseOnHover: true, pauseOnFocus: true },
      loop = true,
      startIndex = 0,
      showArrows = true,
      showDots = true,
      aspectRatio = "16/9",
      contentAlign = "left",
      contentVAlign = "center",
      maxWidth = "7xl",
      paddingX = "6",
      heightClass = "h-[80vh] min-h-[560px]",
      gradientOverlay = { enabled: true, from: "blue-900/40", via: "purple-800/40", to: "transparent", direction: "br" },
      imageMode = "next-image",
      indicatorsVariant = "dots",
      arrowVariant = "solid",
      theme = "lightTextOnDark",
      reducedMotionFallback = "fadeOnly",
      captions = { showEyebrow: true, showHeading: true, showSubheading: true },
      ctaVariant = "primarySecondary",
      shadow = "md",
      rounded = "2xl",
      className,
      animations: customAnimations = {},
    },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex)
    const [isPlaying, setIsPlaying] = useState(autoPlay?.enabled ?? true)
    const [direction, setDirection] = useState(0)
    const [mouseX, setMouseX] = useState(0)
    const [mouseY, setMouseY] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const autoPlayRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const prefersReducedMotion = useReducedMotion()

    const animations: AnimationConfig = useMemo(
      () => ({
        transition: { duration: 0.8, ease: "easeOut", ...customAnimations.transition },
        slideIn: customAnimations.slideIn || (prefersReducedMotion ? "fade" : "slide-left"),
        kenBurns: { scaleFrom: 1.05, scaleTo: 1.0, ...customAnimations.kenBurns },
        parallax: { enabled: !prefersReducedMotion, strength: 0.12, ...customAnimations.parallax },
        text: {
          eyebrow: { type: "fade" as TextAnimationType, delay: 0.05, ...customAnimations.text?.eyebrow },
          heading: {
            type: prefersReducedMotion ? "rise" : "typing",
            delay: 0.1,
            letterStagger: 0.02,
            wordStagger: 0.06,
            ...customAnimations.text?.heading,
          },
          subheading: { type: "slide-up" as TextAnimationType, delay: 0.16, ...customAnimations.text?.subheading },
          ctas: { type: "slide-up" as TextAnimationType, delay: 0.22, ...customAnimations.text?.ctas },
        },
        dots: { activeScale: 1.2, ...customAnimations.dots },
        arrows: { hoverNudgePx: 4, pressScale: 0.96, ...customAnimations.arrows },
      }),
      [customAnimations, prefersReducedMotion],
    )

    const startAutoPlay = useCallback(() => {
      if (!(autoPlay?.enabled ?? true) || prefersReducedMotion) return

      autoPlayRef.current = setTimeout(() => {
        setDirection(1)
        setCurrentIndex((prev) => (loop ? (prev + 1) % slides.length : Math.min(prev + 1, slides.length - 1)))
      }, autoPlay?.delayMs ?? 5000)
    }, [autoPlay?.enabled, autoPlay?.delayMs, loop, slides.length, prefersReducedMotion])

    const stopAutoPlay = useCallback(() => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    }, [])

    useEffect(() => {
      if (isPlaying && (autoPlay?.enabled ?? true)) {
        startAutoPlay()
      }
      return stopAutoPlay
    }, [isPlaying, autoPlay?.enabled, startAutoPlay, stopAutoPlay])

    const handleMouseEnter = () => {
      if (autoPlay?.pauseOnHover) {
        stopAutoPlay()
        setIsPlaying(false)
      }
    }

    const handleMouseLeave = () => {
      if (autoPlay?.pauseOnHover && (autoPlay?.enabled ?? true)) {
        setIsPlaying(true)
      }
    }

    const handleFocus = () => {
      if (autoPlay?.pauseOnFocus) {
        stopAutoPlay()
        setIsPlaying(false)
      }
    }

    const handleBlur = () => {
      if (autoPlay?.pauseOnFocus && (autoPlay?.enabled ?? true)) {
        setIsPlaying(true)
      }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !animations.parallax?.enabled) return
      const rect = containerRef.current.getBoundingClientRect()
      setMouseX((e.clientX - rect.left) / rect.width - 0.5)
      setMouseY((e.clientY - rect.top) / rect.height - 0.5)
    }

    const next = () => {
      setDirection(1)
      setCurrentIndex((prev) => (loop ? (prev + 1) % slides.length : Math.min(prev + 1, slides.length - 1)))
      stopAutoPlay()
      setIsPlaying(autoPlay?.enabled ?? true)
    }

    const prev = () => {
      setDirection(-1)
      setCurrentIndex((prev) => (loop ? (prev - 1 + slides.length) % slides.length : Math.max(prev - 1, 0)))
      stopAutoPlay()
      setIsPlaying(autoPlay?.enabled ?? true)
    }

    const goTo = (index: number) => {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(Math.max(0, Math.min(index, slides.length - 1)))
      stopAutoPlay()
      setIsPlaying(autoPlay?.enabled ?? true)
    }

    useImperativeHandle(ref, () => ({
      next,
      prev,
      goTo,
      play: () => setIsPlaying(true),
      pause: () => {
        setIsPlaying(false)
        stopAutoPlay()
      },
      isPlaying: () => Boolean(isPlaying),
    }))

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          prev()
          break
        case "ArrowRight":
          e.preventDefault()
          next()
          break
        case " ":
          e.preventDefault()
          setIsPlaying(!isPlaying)
          break
        case "Home":
          e.preventDefault()
          goTo(0)
          break
        case "End":
          e.preventDefault()
          goTo(slides.length - 1)
          break
        default:
          break
      }
    }

    const handleTouchStart = useRef<{ x: number; y: number } | null>(null)
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (!handleTouchStart.current) return
      const touch = e.touches[0]
      const diff = handleTouchStart.current.x - touch.clientX

      if (Math.abs(diff) > 60) {
        if (diff > 0) next()
        else prev()
        handleTouchStart.current = null
      }
    }

    const slide = slides[currentIndex]

    const shadowClasses = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    }

    const roundedClasses = {
      none: "",
      "2xl": "rounded-b-2xl",
      full: "rounded-b-full",
    }

    const themeClasses = {
      lightTextOnDark: "text-white",
      darkTextOnLight: "text-slate-900",
    }

    const contentAlignClasses = {
      left: "items-start",
      center: "items-center",
      right: "items-end",
    }

    const contentVAlignClasses = {
      top: "justify-start",
      center: "justify-center",
      bottom: "justify-end",
    }

    const aspectRatioClasses = {
      "16/9": "aspect-video",
      "3/1": "aspect-[3/1]",
      full: "h-screen",
    }

    const heightFinal = aspectRatio === "full" ? "h-screen" : heightClass

    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden bg-gradient-to-br from-[#0A3049] via-[#0A3049] to-[#0A3049] dark:from-slate-950 dark:via-[#0A3049] dark:to-[#0A3049] ${heightFinal} ${roundedClasses[rounded]} ${shadowClasses[shadow]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Hero carousel showing slide ${currentIndex + 1} of ${slides.length}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => (handleTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchMove={handleTouchMove}
      >
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${slide.id}`}
            className="absolute inset-0"
            initial={{
              opacity: 0,
              x: direction > 0 ? 1000 : -1000,
              scale: prefersReducedMotion ? 1 : animations.kenBurns?.scaleFrom || 1.05,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: animations.kenBurns?.scaleTo || 1,
              y:
                animations.parallax?.enabled && direction === 0
                  ? mouseY * (animations.parallax?.strength || 0.12) * 50
                  : 0,
            }}
            exit={{
              opacity: 0,
              x: direction > 0 ? -1000 : 1000,
              scale: prefersReducedMotion ? 1 : animations.kenBurns?.scaleFrom || 1.05,
            }}
            transition={{ duration: animations.transition?.duration || 0.8 }}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              {imageMode === "next-image" ? (
                <Image
                  src={slide.image.src || "/placeholder.svg"}
                  alt={slide.image.alt}
                  fill
                  priority={slide.image.priority}
                  placeholder={slide.image.placeholder}
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <img
                  src={slide.image.src || "/placeholder.svg"}
                  alt={slide.image.alt}
                  className="w-full h-full object-cover"
                  loading={slide.image.priority ? "eager" : "lazy"}
                />
              )}
            </div>

            {/* Gradient Overlay */}
            {gradientOverlay?.enabled && (
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: `linear-gradient(${getGradientDirection(gradientOverlay.direction)}, ${convertColorToRgba(gradientOverlay.from, 0.8)}, ${convertColorToRgba(gradientOverlay.via, 0.5)}, ${convertColorToRgba(gradientOverlay.to, 0)})`,
                }}
              />
            )}

            {/* Content */}
            <div
              className={`absolute inset-0 flex ${contentAlignClasses[contentAlign]} ${contentVAlignClasses[contentVAlign]} z-20`}
            >
              <div className={`w-full ${
                contentAlign === "left" ? "ml-0 mr-auto" :
                contentAlign === "right" ? "ml-auto mr-0" :
                "mx-auto"
              } pl-6 lg:pl-10 xl:pl-36 pr-6 lg:pr-8 xl:pr-12 pt-4 lg:pt-6 pb-12 lg:pb-16 xl:pb-20 ${
                maxWidth === "7xl" ? "max-w-7xl" :
                maxWidth === "6xl" ? "max-w-6xl" :
                maxWidth === "5xl" ? "max-w-5xl" :
                maxWidth === "4xl" ? "max-w-4xl" :
                maxWidth === "3xl" ? "max-w-3xl" :
                maxWidth === "2xl" ? "max-w-2xl" :
                maxWidth === "xl" ? "max-w-xl" :
                maxWidth === "lg" ? "max-w-lg" :
                "max-w-4xl"
              }`}>
                <motion.div
                  className="w-full gap-6 flex flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                {/* Badges */}
                {slide.badges && slide.badges.length > 0 && (
                  <motion.div
                    className="flex gap-2 flex-wrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02, duration: 0.5 }}
                  >
                    {slide.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/20"
                      >
                        {badge}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Eyebrow */}
                {captions.showEyebrow && slide.eyebrow && (
                  <AnimatedText
                    text={slide.eyebrow}
                    type={animations.text?.eyebrow?.type}
                    delay={animations.text?.eyebrow?.delay}
                    className={`text-sm md:text-base font-semibold uppercase tracking-wider ${themeClasses[theme]} opacity-80`}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}

                {/* Heading */}
                {captions.showHeading && (
                  <AnimatedText
                    text={slide.heading}
                    type={animations.text?.heading?.type}
                    delay={animations.text?.heading?.delay}
                    letterStagger={animations.text?.heading?.letterStagger}
                    wordStagger={animations.text?.heading?.wordStagger}
                    typingSpeed={0.03}
                    className={`text-3xl sm:text-4xl  md:text-5xl font-bold leading-tight ${themeClasses[theme]} text-balance`}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}

                {/* Subheading */}
                {captions.showSubheading && slide.subheading && (
                  <AnimatedText
                    text={slide.subheading}
                    type={animations.text?.subheading?.type}
                    delay={animations.text?.subheading?.delay}
                    className={`text-lg md:text-xl max-w-2xl ${themeClasses[theme]} opacity-90 text-pretty`}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}

                {/* KPIs and CTAs - Desktop: one line, Mobile: stacked */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
                  {/* KPIs */}
                  {slide.kpis && slide.kpis.length > 0 && (
                    <motion.div
                      className="grid grid-cols-2 ml-6 lg:grid-cols-2 lg:flex-1 lg:max-w-[60%]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {slide.kpis.map((kpi, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <span className={`text-2xl md:text-3xl font-bold ${themeClasses[theme]}`}>
                            {prefersReducedMotion ? (
                              kpi.value
                            ) : (
                              <CountUpAnimation
                                value={kpi.value}
                                delay={0.2 + idx * 0.1}
                                duration={1.8}
                                className={`text-2xl md:text-3xl font-bold ${themeClasses[theme]}`}
                              />
                            )}
                          </span>
                          <span className={`text-xs md:text-sm ${themeClasses[theme]} opacity-75`}>{kpi.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* CTAs */}
                  {slide.ctas && slide.ctas.length > 0 && (
                    <motion.div
                      className="flex gap-4 flex-wrap lg:flex-nowrap lg:shrink-0 text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: animations.text?.ctas?.delay || 0.22, duration: 0.5 }}
                    >
                      {slide.ctas.map((cta, idx) => (
                        <ColorSwipeButton
                          key={idx}
                          href={cta.href}
                          target={cta.target}
                          label={cta.label}
                          variant={cta.variant}
                          themeClass={themeClasses[theme]}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {showArrows && (
          <>
            <motion.button
              onClick={prev}
              whileHover={{ x: -(animations.arrows?.hoverNudgePx || 4) }}
              whileTap={{ scale: animations.arrows?.pressScale || 0.96 }}
              aria-label="Previous slide"
              className={`absolute hidden lg:block left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-lg transition-all ${
                arrowVariant === "solid"
                  ? "bg-white/90 hover:bg-white text-slate-900 dark:text-slate-900"
                  : arrowVariant === "glass"
                    ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                    : "bg-transparent text-white border border-white/50 hover:border-white/80"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              onClick={next}
              whileHover={{ x: animations.arrows?.hoverNudgePx || 4 }}
              whileTap={{ scale: animations.arrows?.pressScale || 0.96 }}
              aria-label="Next slide"
              className={`absolute hidden lg:block right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-lg transition-all ${
                arrowVariant === "solid"
                  ? "bg-white/90 hover:bg-white text-slate-900 dark:text-slate-900"
                  : arrowVariant === "glass"
                    ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                    : "bg-transparent text-white border border-white/50 hover:border-white/80"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}

        {/* Indicators */}
        {showDots && (
          <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4">
            {indicatorsVariant === "progress" && (
              <motion.div
                className="absolute top-0 left-0 h-1 bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / slides.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            )}

            {indicatorsVariant === "fraction" && (
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {slides.length}
              </span>
            )}

            {(indicatorsVariant === "dots" || indicatorsVariant === "progress") && (
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all ${
                      idx === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                    }`}
                    animate={{
                      scale: idx === currentIndex ? animations.dots?.activeScale || 1.2 : 1,
                      width: idx === currentIndex ? 32 : 8,
                      height: 8,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Region for Screen Readers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Slide {currentIndex + 1} of {slides.length}: {slide.heading}
        </div>
      </div>
    )
  },
)

HeroSlider.displayName = "HeroSlider"

export default HeroSlider
