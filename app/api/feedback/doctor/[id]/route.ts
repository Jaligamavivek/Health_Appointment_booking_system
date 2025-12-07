import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params
    
    const client = await clientPromise
    const db = client.db('healthcare')
    
    // Get all feedback for this doctor
    const feedbackList = await db
      .collection('feedback')
      .find({ doctorId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .toArray()

    if (feedbackList.length === 0) {
      return NextResponse.json({
        averageRating: 0,
        totalReviews: 0,
        reviews: []
      })
    }

    // Calculate average rating
    const totalRating = feedbackList.reduce((sum, feedback) => sum + feedback.rating, 0)
    const averageRating = totalRating / feedbackList.length

    // Format reviews with patient names
    const reviews = await Promise.all(
      feedbackList.map(async (feedback) => {
        // Get patient info
        let patientName = 'Anonymous'
        try {
          const patient = await db
            .collection('users')
            .findOne({ _id: new ObjectId(feedback.patientId) })
          
          if (patient) {
            patientName = `${patient.firstName} ${patient.lastName}`
          }
        } catch (error) {
          console.error('Error fetching patient:', error)
        }

        return {
          patientName,
          rating: feedback.rating,
          review: feedback.review || '',
          date: feedback.createdAt || new Date()
        }
      })
    )

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: feedbackList.length,
      reviews
    })

  } catch (error) {
    console.error('Error fetching doctor feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor feedback' },
      { status: 500 }
    )
  }
}
