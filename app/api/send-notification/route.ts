import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { appointmentId, type, userId, message } = await request.json()

    const supabase = await createClient()

    // Insert notification into database
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      appointment_id: appointmentId,
      type: type,
      message: message,
      read: false,
    })

    if (error) throw error

    // In production, integrate with email service (SendGrid, Resend, etc.)
    // For now, we'll log the notification
    console.log(`[Notification] ${type}: ${message}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
