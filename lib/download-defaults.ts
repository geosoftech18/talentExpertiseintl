/**
 * Default download categories matching the original static /downloads page.
 * Used to seed admin CMS so the public page keeps the same structure.
 */
export const DEFAULT_DOWNLOAD_CATEGORIES = [
  {
    name: 'TEI Profile',
    slug: 'tei-profile',
    description: 'Download our company profile and learn more about Talent Expertise International',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&q=90',
    sortOrder: 1,
  },
  {
    name: 'TEI Training Calendar',
    slug: 'training-calendar',
    description:
      'Access our comprehensive training calendar with all upcoming courses and schedules',
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=90',
    sortOrder: 2,
  },
  {
    name: 'Download by Categories',
    slug: 'by-categories',
    description: 'Browse and download course materials organized by training categories',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=90',
    sortOrder: 3,
  },
  {
    name: 'Download by Course Venue',
    slug: 'by-venue',
    description: 'Find and download course information based on training venue locations',
    imageUrl:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=90',
    sortOrder: 4,
  },
]
