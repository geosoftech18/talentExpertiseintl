"use client"

import { useEffect } from "react"

export default function CopyProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || 
         e.key === 'C' || 
         e.key === 'a' || 
         e.key === 'A' || 
         e.key === 'v' || 
         e.key === 'V' || 
         e.key === 'x' || 
         e.key === 'X' || 
         e.key === 's' || 
         e.key === 'S' || 
         e.key === 'p' || 
         e.key === 'P' || 
         e.key === 'u' || 
         e.key === 'U' ||
         e.key === 'i' ||
         e.key === 'I' ||
         e.key === 'j' ||
         e.key === 'J')
      ) {
        e.preventDefault()
        return false
      }

      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Developer Tools shortcuts)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault()
        return false
      }
    }

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Disable copy event
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Disable cut event
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)

    // Add CSS to prevent text selection
    const style = document.createElement('style')
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.head.removeChild(style)
    }
  }, [])

  return null
}


