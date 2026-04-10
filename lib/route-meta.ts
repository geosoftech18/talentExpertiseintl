export type RouteMeta = {
  title: string
  description: string
}

const BRAND = "Talent Expertise International"

export const defaultMeta: RouteMeta = {
  title: BRAND,
  description:
    "Talent Expertise International provides professional training, coaching, and consultancy services.",
}

const exactMeta: Record<string, RouteMeta> = {
  "/": {
    title: "TEI Training & Consultancy | Professional Development Courses",
    description:
      "Explore world-class public and corporate training courses, schedules, and professional development programs by Talent Expertise International.",
  },
  "/about": {
    title: "About Us | Talent Expertise International",
    description:
      "Learn about Talent Expertise International, our mission, values, and commitment to delivering impactful training and consultancy services.",
  },
  "/services": {
    title: "Services | Training, Coaching & Consultancy",
    description:
      "Discover TEI services including professional training, executive coaching, and consultancy solutions for individuals and organizations.",
  },
  "/coaching": {
    title: "Coaching Programs | Talent Expertise International",
    description:
      "Explore personalized coaching programs designed to strengthen leadership, performance, and career growth.",
  },
  "/consulting": {
    title: "Consulting Services | Talent Expertise International",
    description:
      "Partner with TEI for strategic consulting solutions that improve capability, performance, and organizational outcomes.",
  },
  "/courses": {
    title: "All Courses | Talent Expertise International",
    description:
      "Browse all professional training courses by category, venue, and schedule to find the right program for your goals.",
  },
  "/courses/new": {
    title: "New Programs | Talent Expertise International",
    description:
      "Discover newly launched training programs and upcoming course opportunities from Talent Expertise International.",
  },
  "/calendar": {
    title: "Training Calendar | Talent Expertise International",
    description:
      "View upcoming course schedules by month, category, and venue in the TEI training calendar.",
  },
  "/public-program": {
    title: "Public Programs | Talent Expertise International",
    description:
      "Explore TEI public programs designed for professionals seeking practical skills and recognized learning outcomes.",
  },
  "/venues": {
    title: "Training Venues | Talent Expertise International",
    description:
      "Find TEI training venues and locations to choose the most convenient place for your learning journey.",
  },
  "/certificates": {
    title: "Certificates | Talent Expertise International",
    description:
      "Learn about TEI course certificates and completion credentials for professional development programs.",
  },
  "/downloads": {
    title: "Downloads | Talent Expertise International",
    description:
      "Access TEI downloadable resources, brochures, and category-based documents.",
  },
  "/gallery": {
    title: "Gallery | Talent Expertise International",
    description:
      "View moments from training sessions, events, and facilities in the Talent Expertise International gallery.",
  },
  "/careers": {
    title: "Careers | Talent Expertise International",
    description:
      "Explore career opportunities and join Talent Expertise International to contribute to professional learning excellence.",
  },
  "/contact": {
    title: "Contact Us | Talent Expertise International",
    description:
      "Get in touch with TEI for course inquiries, partnerships, and support from our training advisors.",
  },
  "/why-choose-tei": {
    title: "Why Choose TEI | Talent Expertise International",
    description:
      "See why professionals and organizations choose TEI for quality training delivery, expert faculty, and practical impact.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Talent Expertise International",
    description:
      "Read the Talent Expertise International privacy policy and learn how we collect, use, and protect your information.",
  },
  "/profile": {
    title: "My Profile | Talent Expertise International",
    description:
      "Manage your TEI profile, enrolled courses, and account details in one place.",
  },
  "/auth": {
    title: "Sign In | Talent Expertise International",
    description:
      "Sign in to your TEI account to manage registrations, profile details, and learning activity.",
  },
  "/auth/reset-password": {
    title: "Reset Password | Talent Expertise International",
    description: "Reset your Talent Expertise International account password securely.",
  },
  "/admin": {
    title: "Admin Dashboard | Talent Expertise International",
    description:
      "Manage courses, schedules, mentors, users, and operations from the TEI admin dashboard.",
  },
  "/admin/login": {
    title: "Admin Login | Talent Expertise International",
    description: "Secure admin login for Talent Expertise International management portal.",
  },
  "/admin/orders": {
    title: "Admin Orders | Talent Expertise International",
    description: "View and manage customer orders from the TEI admin panel.",
  },
  "/admin/orders/create": {
    title: "Create Order | Admin | Talent Expertise International",
    description: "Create a new order from the TEI admin order management system.",
  },
  "/admin/invoice-requests": {
    title: "Invoice Requests | Admin | Talent Expertise International",
    description: "Review and process pending invoice requests in the TEI admin panel.",
  },
}

const patternMeta: Array<{ test: (p: string) => boolean; meta: RouteMeta }> = [
  {
    test: (p) => /^\/courses\/[^/]+$/.test(p),
    meta: {
      title: "Course Details | Talent Expertise International",
      description: "View detailed course information, schedules, objectives, and registration options.",
    },
  },
  {
    test: (p) => /^\/courses\/[^/]+\/register$/.test(p),
    meta: {
      title: "Course Registration | Talent Expertise International",
      description: "Register for your selected course with TEI and secure your seat.",
    },
  },
  {
    test: (p) => /^\/courses\/[^/]+\/checkout$/.test(p),
    meta: {
      title: "Checkout | Talent Expertise International",
      description: "Complete your course enrollment and payment securely.",
    },
  },
  {
    test: (p) => /^\/courses\/category\/[^/]+$/.test(p),
    meta: {
      title: "Courses by Category | Talent Expertise International",
      description: "Browse TEI courses grouped by training category.",
    },
  },
  {
    test: (p) => /^\/courses\/venue\/[^/]+$/.test(p),
    meta: {
      title: "Courses by Venue | Talent Expertise International",
      description: "Explore available courses for the selected venue.",
    },
  },
  {
    test: (p) => /^\/courses\/certificate\/[^/]+$/.test(p),
    meta: {
      title: "Certificate Course Details | Talent Expertise International",
      description: "Review certificate course details, outcomes, and enrollment information.",
    },
  },
  {
    test: (p) => /^\/downloads\/[^/]+$/.test(p),
    meta: {
      title: "Download Resources | Talent Expertise International",
      description: "Download category-based resources, materials, and brochures.",
    },
  },
  {
    test: (p) => /^\/admin\/orders\/[^/]+$/.test(p),
    meta: {
      title: "Order Details | Admin | Talent Expertise International",
      description: "View and manage specific order details in the TEI admin portal.",
    },
  },
  {
    test: (p) => /^\/admin\/enquiries\/[^/]+$/.test(p),
    meta: {
      title: "Enquiry Details | Admin | Talent Expertise International",
      description: "Review and respond to course enquiry details from the admin panel.",
    },
  },
  {
    test: (p) => p === "/api/auth/error",
    meta: {
      title: "Authentication Error | Talent Expertise International",
      description: "There was an authentication issue. Please try signing in again.",
    },
  },
]

export function getMetaForPath(pathname: string): RouteMeta {
  return exactMeta[pathname] || patternMeta.find((entry) => entry.test(pathname))?.meta || defaultMeta
}

