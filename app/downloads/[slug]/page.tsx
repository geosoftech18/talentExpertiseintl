'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface DownloadItem {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  fileUrl: string
  fileName: string | null
  fileSize: string | null
}

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  items: DownloadItem[]
}

function DownloadCategoryContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    const load = async () => {
      try {
        setLoading(true)
        setNotFound(false)
        const res = await fetch(`/api/download-categories/${encodeURIComponent(slug)}`)
        const json = await res.json()
        if (!res.ok || !json.success) {
          setCategory(null)
          setNotFound(true)
          return
        }
        setCategory(json.data)
      } catch (e) {
        console.error('Error loading category downloads:', e)
        setCategory(null)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  const handleDownload = (fileUrl: string) => {
    const url = fileUrl.includes('?') ? `${fileUrl}&download=1` : `${fileUrl}?download=1`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="relative bg-gradient-to-r from-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/downloads')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Downloads
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                {category?.name || 'Downloads'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {category?.name || (loading ? 'Loading...' : 'Downloads')}
              </h1>
              <p className="text-blue-100 text-lg">
                {category?.description || 'Download resources and materials'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : notFound ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Category not found</h3>
              <p className="text-slate-600 mb-6">This download category does not exist.</p>
              <Button asChild>
                <Link href="/downloads">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Downloads
                </Link>
              </Button>
            </div>
          ) : category && category.items.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((item) => (
                <Card
                  key={item.id}
                  className="group border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative h-[200px] bg-slate-200 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={
                          item.imageUrl.startsWith('data:') || item.imageUrl.startsWith('http')
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                        <FileText className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {item.description || 'Download this resource'}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 truncate">
                        {item.fileSize || item.fileName || ''}
                      </span>
                      <Button
                        onClick={() => handleDownload(item.fileUrl)}
                        className="bg-gradient-to-r from-[#0A3049] to-[#0A3049] hover:opacity-90 text-white"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No downloads available</h3>
              <p className="text-slate-600 mb-6">
                There are no downloads available in this category yet.
              </p>
              <Button asChild>
                <Link href="/downloads">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Downloads
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function DownloadCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DownloadCategoryContent />
    </Suspense>
  )
}
