/**
 * Parse content to detect and extract bullet points and lists
 */

export interface ParsedContent {
  type: 'html' | 'list' | 'paragraph' | 'mixed'
  items?: string[]
  itemsHtml?: string[] // List items with HTML preserved
  html?: string
  plainText?: string
  description?: string // Description text before list
  descriptionHtml?: string // Description with HTML preserved
}

/**
 * Extract list items from HTML (ul/ol) or plain text, preserving HTML formatting
 */
export function parseContent(content: string | null | undefined): ParsedContent {
  if (!content) {
    return { type: 'paragraph', plainText: '' }
  }

  // Check if it's HTML
  if (content.includes('<')) {
    // Check if HTML contains list elements
    if (content.includes('<ul>') || content.includes('<ol>') || content.includes('<li>')) {
      // Extract content before the list (description)
      const listStartMatch = content.match(/<(ul|ol)[^>]*>/i)
      const listStartIndex = listStartMatch ? content.indexOf(listStartMatch[0]) : -1
      
      let descriptionHtml = ''
      if (listStartIndex > 0) {
        descriptionHtml = content.substring(0, listStartIndex).trim()
      }

      // Extract list items with HTML preserved
      const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi
      const itemsHtml: string[] = []
      let match

      while ((match = listItemRegex.exec(content)) !== null) {
        const itemHtml = match[1].trim()
        if (itemHtml) {
          itemsHtml.push(itemHtml)
        }
      }

      if (itemsHtml.length > 0) {
        // If we have both description and list items, return mixed
        if (descriptionHtml) {
          return { 
            type: 'mixed', 
            itemsHtml,
            descriptionHtml,
            description: descriptionHtml.replace(/<[^>]*>/g, '').trim() // Plain text version
          }
        }
        // Just list items
        return { 
          type: 'list', 
          itemsHtml,
          items: itemsHtml.map(item => item.replace(/<[^>]*>/g, '').trim()) // Plain text version
        }
      }

      // If we have list HTML but couldn't parse items, return as HTML
      return { type: 'html', html: content }
    }

    // Other HTML content
    return { type: 'html', html: content }
  }

  // Plain text - check for bullet points
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Check if lines start with bullet markers
  const bulletPatterns = [
    /^[-•*]\s+/, // - or • or *
    /^\d+[.)]\s+/, // 1. or 1)
    /^[a-zA-Z][.)]\s+/, // a. or a)
  ]

  const bulletedLines = lines.filter(line => 
    bulletPatterns.some(pattern => pattern.test(line))
  )

  // Find the first bullet line to separate description from list
  const firstBulletIndex = lines.findIndex(line => 
    bulletPatterns.some(pattern => pattern.test(line))
  )

  // Extract description (text before first bullet)
  let description = ''
  if (firstBulletIndex > 0) {
    description = lines.slice(0, firstBulletIndex).join('\n').trim()
  }

  // Extract list items
  if (bulletedLines.length > 0) {
    const listLines = firstBulletIndex >= 0 ? lines.slice(firstBulletIndex) : lines
    const items = listLines.map(line => {
      // Remove bullet markers
      return line
        .replace(/^[-•*]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .replace(/^[a-zA-Z][.)]\s+/, '')
        .trim()
    }).filter(item => item.length > 0)

    if (items.length > 0) {
      // If we have both description and list items, return mixed
      if (description) {
        return { 
          type: 'mixed', 
          items,
          description
        }
      }
      // Just list items
      return { type: 'list', items }
    }
  }

  // Treat as paragraph
  return { type: 'paragraph', plainText: content }
}

