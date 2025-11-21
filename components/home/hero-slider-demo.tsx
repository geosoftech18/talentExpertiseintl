"use client"

import { useRef } from "react"
import HeroSlider, { type HeroSliderHandle, type Slide } from "./hero-slider"

const HERO_SLIDES: Slide[] = [
  {
    id: "1",
    eyebrow: "Training & Consulting",
    heading: "Exceptional provider of training, coaching & consulting",
    subheading: "Seamless, end-to-end experience via 100+ accredited senior experts.",
    badges: ["Expert Training", "Proven Results"],
    kpis: [
      { label: "Senior Experts", value: "100+" },
      { label: "Years Experience", value: "25+" },
    ],
    ctas: [
      { label: "Get Started", href: "/contact", variant: "primary" },
      { label: "Learn More", href: "/about", variant: "secondary" },
    ],
    image: {
      src: "/slider/1.jpg",
      alt: "Training professionals in a modern conference room",
      priority: true,
      placeholder: "empty",
    },
    overlay: {
      from: "rgba(0,0,0,0.8)",
      via: "rgba(0,0,0,0.5)",
      to: "transparent",
      direction: "br",
    },
  },
  {
    id: "2",
    eyebrow: "Global Network",
    heading: "100+ senior experts across 36+ cities",
    subheading: "Partnering with premier venues to ensure excellence at every touchpoint.",
    badges: ["Global Reach", "36+ Cities"],
    kpis: [
      { label: "Cities", value: "36+" },
      { label: "Experts", value: "100+" },
    ],
    ctas: [
      { label: "Explore Locations", href: "/venues", variant: "primary" },
      { label: "Find Expert", href: "/contact", variant: "secondary" },
    ],
    image: {
      src: "/slider/2.jpg",
      alt: "Global network visualization showing worldwide connections",
      placeholder: "empty",
    },
  },
  {
    id: "3",
    eyebrow: "Our Impact",
    heading: "Tens of thousands upskilled worldwide",
    subheading: "We address the full life cycle of learning with long-lasting solutions.",
    badges: ["Impactful", "Sustainable"],
    kpis: [
      { label: "Upskilled", value: "50K+" },
      { label: "Satisfaction", value: "98%" },
    ],
    ctas: [
      { label: "View Results", href: "#", variant: "primary" },
      { label: "Read Stories", href: "#", variant: "ghost" },
    ],
    image: {
      src: "/diverse-professionals-celebrating-success-achievem.jpg",
      alt: "Diverse group of professionals celebrating success",
      placeholder: "empty",
    },
  },
  {
    id: "4",
    eyebrow: "Core Values",
    heading: "Our Values: Family • Integrity • Caring • Trust",
    subheading: "We never compromise on our core values and relationships.",
    badges: ["Values-Driven", "Trustworthy"],
    kpis: [
      { label: "Years", value: "25+" },
      { label: "Clients", value: "1000+" },
    ],
    ctas: [
      { label: "About Us", href: "/about", variant: "primary" },
      { label: "Contact", href: "/contact", variant: "secondary" },
    ],
    image: {
      src: "/team-collaboration-values-trust-integrity.jpg",
      alt: "Team collaboration representing shared values",
      placeholder: "empty",
    },
  },
]

export const HeroSliderDemo = () => {
  const sliderRef = useRef<HeroSliderHandle>(null)

  return (
    <div className="w-full">
      <HeroSlider
        ref={sliderRef}
        slides={HERO_SLIDES}
        autoPlay={{
          enabled: true,
          delayMs: 5000,
          pauseOnHover: true,
          pauseOnFocus: true,
        }}
        loop={true}
        startIndex={0}
        showArrows={true}
        showDots={true}
        aspectRatio="16/9"
        contentAlign="left"
        contentVAlign="center"
        maxWidth="4xl"
        heightClass="h-[80vh] min-h-[560px]"
        indicatorsVariant="dots"
        arrowVariant="glass"
        theme="lightTextOnDark"
        captions={{
          showEyebrow: true,
          showHeading: true,
          showSubheading: true,
        }}
        ctaVariant="primarySecondary"
        shadow="xl"
        rounded="2xl"
        animations={{
          slideIn: "slide-left",
          text: {
            eyebrow: { type: "fade", delay: 0.05 },
            heading: { type: "typing", delay: 0.1 },
            subheading: { type: "slide-up", delay: 0.5 },
            ctas: { type: "slide-up", delay: 0.8 },
          },
          parallax: { enabled: true, strength: 0.12 },
          kenBurns: { scaleFrom: 1.05, scaleTo: 1.0 },
        }}
      />
    </div>
  )
}

export default HeroSliderDemo
