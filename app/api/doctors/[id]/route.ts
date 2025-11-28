import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 16
    const { id } = await params
    
    // Handle both ObjectId and string formats
    let doctor
    try {
      doctor = await DatabaseService.findDoctorById(id)
    } catch (error) {
      // If ObjectId format fails, try finding by string ID
      const doctors = await DatabaseService.getAllDoctors()
      doctor = doctors.find(d => d.id === id || d._id?.toString() === id)
    }
    
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }
    return NextResponse.json(doctor)
  } catch (error) {
    console.error("Get doctor error:", error)
    return NextResponse.json({ error: "Failed to get doctor" }, { status: 500 })
  }
}