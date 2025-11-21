"use client"

import { Quote, Award, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface CEOMessageProps {
  name?: string
  title?: string
  image?: string
  message?: string
}

export function CEOMessage({
  name = "John Smith",
  title = "Chief Executive Officer",
  image,
  message = "At TEI Training, we believe that exceptional training is the cornerstone of professional excellence. For over three decades, we have dedicated ourselves to empowering individuals and organizations worldwide with world-class training programs that drive real, measurable results.\n\nOur commitment to excellence, innovation, and integrity has made us a trusted partner for thousands of professionals across the globe. We understand that every learner is unique, and our personalized approach ensures that each participant receives the guidance and support they need to succeed.\n\nAs we look to the future, we remain steadfast in our mission to transform careers and organizations through meaningful learning experiences. We invite you to join us on this journey of growth and discovery."
}: CEOMessageProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1.5 text-sm font-semibold mb-4">
            Leadership
          </Badge>
          <h2 className="md:text-4xl text-2xl font-bold text-slate-900 mb-4">
            A Message from Our CEO
          </h2>
          <p className="md:text-xl text-lg text-slate-600 max-w-3xl mx-auto">
            Hear directly from our leadership about our vision, values, and commitment to excellence
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Left Side - CEO Image & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* CEO Image Card */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 z-10" />
                
                {/* Image Container */}
                <div className="relative h-80 flex items-center justify-center p-8">
                  <div className="relative z-20">
                    <div className="relative">
                      {/* Outer Glow Ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse" />
                      
                      {/* Avatar */}
                      <Avatar className="w-48 h-48 border-8 border-white shadow-2xl relative z-10">
                        <AvatarImage src={image} alt={name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white text-5xl font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>

                {/* CEO Info */}
                <CardContent className="pt-6 pb-8 px-8 text-center bg-white">
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{name}</h3>
                  <p className="text-lg text-slate-600 font-medium mb-6">{title}</p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">30+</p>
                      <p className="text-xs text-slate-600">Years</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">1M+</p>
                      <p className="text-xs text-slate-600">Trained</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Right Side - Message */}
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Main Message Card */}
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />

                <CardContent className="pt-10 pb-12 px-8 md:px-12 relative z-10">
                  {/* Opening Quote */}
                  <div className="mb-6">
                    <Quote className="w-16 h-16 text-blue-500/20 rotate-180" />
                  </div>

                  {/* Message Title */}
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                    A Personal Message
                  </h2>

                  {/* Message Content */}
                  <div className="space-y-6 mb-8">
                    {message.split('\n\n').map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-lg text-slate-700 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Closing Quote */}
                  <div className="flex justify-end mb-6">
                    <Quote className="w-16 h-16 text-purple-500/20" />
                  </div>

                  {/* Signature Line */}
                  <div className="pt-6 border-t-2 border-gradient-to-r from-blue-500 to-purple-500 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">{name}</p>
                        <p className="text-sm text-slate-600">{title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs font-medium">TEI Training</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
