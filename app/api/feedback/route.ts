import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie')
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies?.['auth-token']
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { appointment_id, doctor_id, rating, review } = await request.json()

    // Verify the appointment belongs to the user and is completed
    const appointment = await DatabaseService.findAppointmentById(appointment_id)
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }
    
    if (appointment.patientId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Appointment does not belong to user" }, { status: 403 })
    }
    
    if (appointment.status !== "completed") {
      return NextResponse.json({ error: "Appointment is not completed" }, { status: 400 })
    }

    // Create feedback
    const feedback = await DatabaseService.createFeedback({
      appointmentId: appointment_id,
      patientId: payload.userId,
      doctorId: doctor_id,
      rating,
      review,
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Feedback creation error:", error)
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctor_id")
    const userId = searchParams.get("user_id")

    if (doctorId) {
      // Get feedback for a specific doctor by doctor ID
      const feedback = await DatabaseService.getFeedbackByDoctor(doctorId)
      return NextResponse.json(feedback)
    }

    if (userId) {
      // Get feedback for a doctor by user ID - first find the doctor record
      const doctor = await DatabaseService.findDoctorByUserId(userId)
      
      if (doctor && doctor._id) {
        const feedback = await DatabaseService.getFeedbackByDoctor(doctor._id.toString())
        return NextResponse.json(feedback)
      } else {
        return NextResponse.json([])
      }
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Feedback fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}
