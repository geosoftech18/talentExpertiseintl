"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getMetaForPath } from "@/lib/route-meta"

function setMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute("name", name)
    document.head.appendChild(element)
  }
  element.setAttribute("content", content)
}

export default function RouteMetadata() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    const selected = getMetaForPath(pathname)

    document.title = selected.title
    setMetaTag("description", selected.description)
  }, [pathname])

  return null
}

