'use client'

import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CourseScheduleCardProps {
  schedule: {
    id: string
    start_date: string
    end_date?: string | null
    venue: string
    price: number
    seats_available: number
    status: string
  }
}

export function CourseScheduleCard({ schedule }: CourseScheduleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">
              {formatDate(schedule.start_date)}
              {schedule.end_date && ` - ${formatDate(schedule.end_date)}`}
            </span>
          </div>
          <Badge variant={schedule.status === 'open' ? 'default' : 'secondary'}>
            {schedule.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{schedule.venue}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4" />
              <span>{schedule.seats_available} seats available</span>
            </div>
            <span className="font-bold text-slate-900">${schedule.price.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

