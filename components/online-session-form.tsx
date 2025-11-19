'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/hooks/use-require-auth'

interface OnlineSessionFormProps {
  course: {
    id: string
    title: string
  }
  onClose: () => void
}

export function OnlineSessionForm({ course, onClose }: OnlineSessionFormProps) {
  // Check authentication - redirects to /auth if not logged in
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Dialog open={true}>
        <DialogContent>
          <p className="text-gray-600 text-center py-4">Checking authentication...</p>
        </DialogContent>
      </Dialog>
    )
  }
  
  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/forms/online-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }

      alert('Thank you! Your online session request has been submitted successfully.')
      onClose()
    } catch (error) {
      console.error('Error submitting online session request:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Request Online Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
            <p className="text-slate-600">
              Online session request form will be implemented here. This is a placeholder component.
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

