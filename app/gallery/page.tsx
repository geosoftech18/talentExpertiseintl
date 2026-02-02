'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { X, Search, Filter, Grid3x3, LayoutGrid, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

// Gallery images - you can expand this with more images
const galleryImages = [
  // Training Sessions
  { id: 1, src: '/slider/1.jpg', category: 'Training Sessions', title: 'Professional Training Session', description: 'Interactive learning environment' },
  { id: 2, src: '/slider/2.jpg', category: 'Training Sessions', title: 'Expert-Led Workshop', description: 'Hands-on practical training' },
  { id: 3, src: '/clients/1.jpg', category: 'Training Sessions', title: 'Corporate Training', description: 'Team building and development' },
  { id: 4, src: '/clients/2.jpg', category: 'Training Sessions', title: 'Skills Development', description: 'Enhancing professional capabilities' },
  { id: 5, src: '/clients/3.jpg', category: 'Training Sessions', title: 'Leadership Program', description: 'Executive leadership training' },
  { id: 6, src: '/clients/4.jpg', category: 'Training Sessions', title: 'Technical Training', description: 'Specialized technical skills' },
  
  // Venues & Facilities
  { id: 7, src: '/clients/5.jpg', category: 'Venues & Facilities', title: 'Modern Training Facility', description: 'State-of-the-art learning spaces' },
  { id: 8, src: '/clients/6.jpg', category: 'Venues & Facilities', title: 'Conference Hall', description: 'Spacious and well-equipped' },
  { id: 9, src: '/clients/7.jpg', category: 'Venues & Facilities', title: 'Training Center', description: 'Professional learning environment' },
  { id: 10, src: '/clients/8.jpg', category: 'Venues & Facilities', title: 'Workshop Space', description: 'Interactive training rooms' },
  { id: 11, src: '/clients/9.jpg', category: 'Venues & Facilities', title: 'Executive Suite', description: 'Premium training facilities' },
  { id: 12, src: '/clients/10.jpg', category: 'Venues & Facilities', title: 'Learning Hub', description: 'Collaborative learning spaces' },
  
  // Certificates & Achievements
  { id: 13, src: '/clients/11.jpg', category: 'Certificates & Achievements', title: 'Certificate Ceremony', description: 'Recognizing excellence' },
  { id: 14, src: '/clients/12.jpg', category: 'Certificates & Achievements', title: 'Graduation Event', description: 'Celebrating success' },
  { id: 15, src: '/clients/13.jpg', category: 'Certificates & Achievements', title: 'Award Presentation', description: 'Honoring achievements' },
  { id: 16, src: '/clients/14.jpg', category: 'Certificates & Achievements', title: 'Recognition Ceremony', description: 'Celebrating milestones' },
  
  // Team & Participants
  { id: 17, src: '/clients/15.jpg', category: 'Team & Participants', title: 'Engaged Participants', description: 'Active learning community' },
  { id: 18, src: '/clients/16.jpg', category: 'Team & Participants', title: 'Group Discussion', description: 'Collaborative learning' },
  { id: 19, src: '/clients/17.jpg', category: 'Team & Participants', title: 'Networking Session', description: 'Building connections' },
  { id: 20, src: '/clients/18.jpg', category: 'Team & Participants', title: 'Team Building', description: 'Strengthening bonds' },
  { id: 21, src: '/clients/19.jpg', category: 'Team & Participants', title: 'Interactive Workshop', description: 'Hands-on experience' },
  { id: 22, src: '/clients/20.jpg', category: 'Team & Participants', title: 'Learning Together', description: 'Shared knowledge' },
  
  // Events & Conferences
  { id: 23, src: '/clients/21.jpg', category: 'Events & Conferences', title: 'Annual Conference', description: 'Industry insights' },
  { id: 24, src: '/clients/22.jpg', category: 'Events & Conferences', title: 'Professional Summit', description: 'Expert presentations' },
  { id: 25, src: '/clients/23.jpg', category: 'Events & Conferences', title: 'Training Expo', description: 'Showcasing excellence' },
  { id: 26, src: '/clients/24.jpg', category: 'Events & Conferences', title: 'Industry Forum', description: 'Knowledge sharing' },
  
  // Add more images as needed
  { id: 27, src: '/clients/25.jpg', category: 'Training Sessions', title: 'Advanced Training', description: 'Specialized programs' },
  { id: 28, src: '/clients/26.jpg', category: 'Training Sessions', title: 'Skills Workshop', description: 'Practical learning' },
  { id: 29, src: '/clients/27.jpg', category: 'Venues & Facilities', title: 'Modern Venue', description: 'Contemporary spaces' },
  { id: 30, src: '/clients/28.jpg', category: 'Team & Participants', title: 'Active Learning', description: 'Engaged participants' },
]

const categories = ['All', 'Training Sessions', 'Venues & Facilities', 'Certificates & Achievements', 'Team & Participants', 'Events & Conferences']

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry')

  // Filter images based on category and search
  const filteredImages = useMemo(() => {
    return galleryImages.filter(image => {
      const matchesCategory = selectedCategory === 'All' || image.category === selectedCategory
      const matchesSearch = searchQuery === '' || 
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const openLightbox = (image: typeof galleryImages[0]) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'unset'
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    let newIndex: number
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    }
    
    setSelectedImage(filteredImages[newIndex])
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') navigateImage('prev')
    if (e.key === 'ArrowRight') navigateImage('next')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl text-center mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Program Gallery
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Explore our training programs, facilities, and achievements through our visual showcase
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters and Search Section */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-[#0A3049] rounded-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full transition-all ${
                    selectedCategory === category
                      ? 'bg-[#0A3049] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#0A3049] text-white' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('masonry')}
                className={viewMode === 'masonry' ? 'bg-[#0A3049] text-white' : ''}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-[#0A3049]">{filteredImages.length}</span> image{filteredImages.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </div>
        </div>
      </section>

      {/* Gallery Grid - Dynamic Layout */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No images found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {viewMode === 'grid' ? (
              // Creative Staggered Grid Layout
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence>
                  {filteredImages.map((image, index) => {
                    // Create dynamic sizing pattern for visual interest
                    const sizePattern = index % 8
                    let heightClass = 'h-[280px]'
                    let isWide = false
                    let isTall = false
                    
                    // Pattern for varied sizes - creates visual rhythm
                    if (sizePattern === 0) {
                      heightClass = 'h-[380px] sm:col-span-2'
                      isWide = true
                    } else if (sizePattern === 2) {
                      heightClass = 'h-[320px]'
                      isTall = true
                    } else if (sizePattern === 4) {
                      heightClass = 'h-[360px] sm:col-span-2'
                      isWide = true
                    } else if (sizePattern === 6) {
                      heightClass = 'h-[300px]'
                    } else {
                      heightClass = 'h-[280px]'
                    }

                    return (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 50, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.04,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                        className={isWide ? 'sm:col-span-2' : ''}
                        style={{
                          perspective: '1000px'
                        }}
                      >
                        <Card
                          className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#0A3049] transition-all duration-500 hover:shadow-2xl bg-white h-full transform hover:-translate-y-3 hover:rotate-1"
                          onClick={() => openLightbox(image)}
                        >
                          <div className={`relative ${heightClass} overflow-hidden bg-gray-100`}>
                            <Image
                              src={image.src}
                              alt={image.title}
                              fill
                              className="object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                              sizes={isWide ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.src = '/placeholder.jpg'
                              }}
                            />
                            {/* Animated Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end">
                              <motion.div 
                                className="p-4 md:p-6 text-white"
                                initial={{ y: 20, opacity: 0 }}
                                whileHover={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <h3 className="font-bold text-lg md:text-xl mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{image.title}</h3>
                                <p className="text-sm md:text-base text-gray-200 mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">{image.description}</p>
                                <Badge className="bg-[#0A3049] text-white hover:bg-[#0A3049]/90 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-100">{image.category}</Badge>
                              </motion.div>
                            </div>
                            {/* Animated Zoom icon */}
                            <motion.div 
                              className="absolute top-4 right-4"
                              initial={{ scale: 0, rotate: -180 }}
                              whileHover={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                              <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl">
                                <ZoomIn className="w-5 h-5 text-[#0A3049]" />
                              </div>
                            </motion.div>
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#0A3049]/30 via-[#0A3049]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0A3049] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform scale-x-0 group-hover:scale-x-100 origin-center" />
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              // Pinterest-style Masonry Layout
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
                <AnimatePresence>
                  {filteredImages.map((image, index) => {
                    // Vary heights for masonry effect
                    const heightVariation = index % 4
                    let minHeight = 'min-h-[250px]'
                    if (heightVariation === 0) minHeight = 'min-h-[300px]'
                    else if (heightVariation === 1) minHeight = 'min-h-[350px]'
                    else if (heightVariation === 2) minHeight = 'min-h-[280px]'
                    else minHeight = 'min-h-[320px]'

                    return (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.04,
                          type: "spring",
                          stiffness: 80
                        }}
                        className="break-inside-avoid mb-4 md:mb-6"
                      >
                        <Card
                          className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#0A3049] transition-all duration-500 hover:shadow-2xl bg-white transform hover:-translate-y-1"
                          onClick={() => openLightbox(image)}
                        >
                          <div className={`relative ${minHeight} overflow-hidden bg-gray-100`}>
                            <Image
                              src={image.src}
                              alt={image.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.src = '/placeholder.jpg'
                              }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end">
                              <div className="p-4 md:p-5 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-bold text-lg mb-2">{image.title}</h3>
                                <p className="text-sm text-gray-200 mb-3 line-clamp-2">{image.description}</p>
                                <Badge className="bg-[#0A3049] text-white">{image.category}</Badge>
                              </div>
                            </div>
                            {/* Zoom icon */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform rotate-0 group-hover:rotate-12">
                              <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                                <ZoomIn className="w-4 h-4 text-[#0A3049]" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation()
                navigateImage('prev')
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation()
                navigateImage('next')
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.src = '/placeholder.jpg'
                  }}
                />
              </div>
              
              {/* Image Info */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 w-full text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                    <p className="text-gray-300 mb-3">{selectedImage.description}</p>
                    <Badge className="bg-[#0A3049] text-white">{selectedImage.category}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = selectedImage.src
                      link.download = selectedImage.title.replace(/\s+/g, '-') + '.jpg'
                      link.click()
                    }}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Image {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} of {filteredImages.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

