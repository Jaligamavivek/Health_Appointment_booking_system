import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    // Initialize sample data if needed
    await DatabaseService.initializeSampleData()
    
    const doctors = await DatabaseService.getAllDoctors()
    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Get doctors error:", error)
    return NextResponse.json({ error: "Failed to get doctors" }, { status: 500 })
  }
}