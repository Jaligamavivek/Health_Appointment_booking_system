"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push("/auth/login")
          return
        }

        const data = await response.json()
        // For now, allow any logged-in user to access admin
        // In production, you'd check for admin role
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <AdminDashboard userId={user.id} adminUser={{ id: user.id, role: 'admin', permissions: [] }} />
}
