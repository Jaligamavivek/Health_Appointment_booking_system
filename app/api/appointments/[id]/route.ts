import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 16
    const { id } = await params
    
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

    const updateData = await request.json()
    await DatabaseService.updateAppointment(id, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update appointment error:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}