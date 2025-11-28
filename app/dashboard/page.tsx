"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PatientDashboard from "@/components/patient-dashboard"
import DoctorDashboard from "@/components/doctor-dashboard"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push("/auth/login")
          return
        }

        const data = await response.json()
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("Dashboard: Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center text-red-600">
            Authentication error. Redirecting to login...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {user.userType === "doctor" ? (
        <DoctorDashboard userId={user.id} profile={user} />
      ) : (
        <PatientDashboard userId={user.id} profile={user} />
      )}
    </div>
  )
}
