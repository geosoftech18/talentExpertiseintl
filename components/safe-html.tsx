'use client'

import { useLayoutEffect, useRef } from 'react'

type SafeHtmlProps = {
  html: string
  className?: string
}

/**
 * TipTap stores blank lines as empty <p></p> (or br-only paragraphs).
 * Browsers collapse those to zero height, so blank lines disappear on the frontend.
 */
export function preserveEditorLineBreaks(html: string): string {
  if (!html) return ''
  return html
    .replace(/<p([^>]*)>(?:\s|&nbsp;|&#160;|\u00a0)*<\/p>/gi, '<p$1><br></p>')
    .replace(/<p([^>]*)>\s*(?:<br\s*\/?>\s*)+\s*<\/p>/gi, '<p$1><br></p>')
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
    const normalized = preserveEditorLineBreaks(html || '')
    if (lastHtml.current === normalized) return
    lastHtml.current = normalized
    el.innerHTML = normalized
    return () => {
      // Clear on unmount so React never fights leftover DOM from browser rewrites
      if (ref.current) ref.current.innerHTML = ''
      lastHtml.current = null
    }
  }, [html])

  return (
    <div
      ref={ref}
      className={['rich-text-content', className].filter(Boolean).join(' ')}
      suppressHydrationWarning
    />
  )
}
