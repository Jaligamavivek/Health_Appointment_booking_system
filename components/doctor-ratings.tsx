"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Feedback {
  _id: string
  rating: number
  review?: string
  createdAt: string
  patientId: string
  appointmentId: string
  doctorId: string
}

interface DoctorRatingsProps {
  userId: string
}

export default function DoctorRatings({ userId }: DoctorRatingsProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true)
      
      try {
        const response = await fetch(`/api/feedback?user_id=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          setFeedback(data || [])
          if (data && data.length > 0) {
            const avg = data.reduce((sum: number, f: any) => sum + f.rating, 0) / data.length
            setAverageRating(Math.round(avg * 10) / 10)
          }
        }
      } catch (error) {
        console.error("Error fetching feedback:", error)
      }
      setIsLoading(false)
    }

    if (userId) {
      fetchFeedback()
    }
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-neutral-600">
          Loading ratings...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Doctor Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= averageRating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xl font-bold">{averageRating}</span>
            <span className="text-neutral-600">({feedback.length} reviews)</span>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      {feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedback.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      Patient ID: {review.patientId.toString().slice(0, 8)}...
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-sm text-gray-700">{review.review}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {feedback.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-neutral-600">
            No reviews yet.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
