import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointment_id")

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 })
    }

    const feedback = await DatabaseService.getFeedbackByAppointment(appointmentId)
    return NextResponse.json({ exists: !!feedback })
  } catch (error) {
    console.error("Feedback check error:", error)
    return NextResponse.json({ exists: false })
  }
}