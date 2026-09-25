'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Search, Filter, Grid3x3, LayoutGrid, ChevronLeft, ChevronRight, ZoomIn, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface GalleryImage {
  id: string
  name: string
  imageUrl: string
  sortOrder: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry')

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/gallery')
        const result = await res.json()
        setImages(result.success && Array.isArray(result.data) ? result.data : [])
      } catch (err) {
        console.error('Failed to load gallery:', err)
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images
    const q = searchQuery.toLowerCase()
    return images.filter((image) => image.name.toLowerCase().includes(q))
  }, [images, searchQuery])

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'unset'
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage || filteredImages.length === 0) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id)
    if (currentIndex < 0) return

    let newIndex: number
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    }

    setSelectedImage(filteredImages[newIndex])
  }

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

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-[#0A3049]">{filteredImages.length}</span> image
            {filteredImages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A3049]" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              {images.length === 0 ? 'No gallery images yet' : 'No images found'}
            </h3>
            <p className="text-gray-500">
              {images.length === 0
                ? 'Gallery images will appear here once added from the admin panel.'
                : 'Try adjusting your search query'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence>
                  {filteredImages.map((image, index) => {
                    const sizePattern = index % 8
                    let heightClass = 'h-[280px]'
                    let isWide = false

                    if (sizePattern === 0) {
                      heightClass = 'h-[380px] sm:col-span-2'
                      isWide = true
                    } else if (sizePattern === 2) {
                      heightClass = 'h-[320px]'
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
                          type: 'spring',
                          stiffness: 100,
                          damping: 15,
                        }}
                        className={isWide ? 'sm:col-span-2' : ''}
                        style={{ perspective: '1000px' }}
                      >
                        <Card
                          className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#0A3049] transition-all duration-500 hover:shadow-2xl bg-white h-full transform hover:-translate-y-3 hover:rotate-1"
                          onClick={() => openLightbox(image)}
                        >
                          <div className={`relative ${heightClass} overflow-hidden bg-gray-100`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.imageUrl}
                              alt={image.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end">
                              <div className="p-4 md:p-6 text-white">
                                <h3 className="font-bold text-lg md:text-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                  {image.name}
                                </h3>
                              </div>
                            </div>
                            <motion.div
                              className="absolute top-4 right-4"
                              initial={{ scale: 0, rotate: -180 }}
                              whileHover={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                              <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl">
                                <ZoomIn className="w-5 h-5 text-[#0A3049]" />
                              </div>
                            </motion.div>
                            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#0A3049]/30 via-[#0A3049]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0A3049] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform scale-x-0 group-hover:scale-x-100 origin-center" />
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
                <AnimatePresence>
                  {filteredImages.map((image, index) => {
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
                          type: 'spring',
                          stiffness: 80,
                        }}
                        className="break-inside-avoid mb-4 md:mb-6"
                      >
                        <Card
                          className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-[#0A3049] transition-all duration-500 hover:shadow-2xl bg-white transform hover:-translate-y-1"
                          onClick={() => openLightbox(image)}
                        >
                          <div className={`relative ${minHeight} overflow-hidden bg-gray-100`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.imageUrl}
                              alt={image.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end">
                              <div className="p-4 md:p-5 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-bold text-lg">{image.name}</h3>
                              </div>
                            </div>
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {filteredImages.length > 1 && (
              <>
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
              </>
            )}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 w-full text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedImage.name}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = selectedImage.imageUrl
                      link.download = selectedImage.name.replace(/\s+/g, '-') + '.jpg'
                      link.click()
                    }}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Image {filteredImages.findIndex((img) => img.id === selectedImage.id) + 1} of{' '}
                  {filteredImages.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
