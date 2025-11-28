import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (userId && userId === payload.userId) {
      // For now, return empty notifications array
      // You can implement DatabaseService.getNotificationsByUser if needed
      return NextResponse.json([])
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 })
  }
}