'use client'

import { useLayoutEffect, useRef } from 'react'

type SafeHtmlProps = {
  html: string
  className?: string
}

/**
 * Renders HTML outside React's child reconciliation.
 * Prevents NotFoundError removeChild when browser rewrites TipTap markup
 * (nested <p>, lists, etc.) under dangerouslySetInnerHTML.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lastHtml = useRef<string | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (lastHtml.current === html) return
    lastHtml.current = html
    el.innerHTML = html || ''
    return () => {
      // Clear on unmount so React never fights leftover DOM from browser rewrites
      if (ref.current) ref.current.innerHTML = ''
      lastHtml.current = null
    }
  }, [html])

  return (
    <div
      ref={ref}
      className={className}
      suppressHydrationWarning
    />
  )
}
