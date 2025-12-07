"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import NotificationsPanel from "./notifications-panel"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  user_type: string
  created_at?: string
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  reason: string
  status: string
}

interface AdminUser {
  id: string
  role: string
  permissions: string[]
}

export default function AdminDashboard({
  userId,
  adminUser,
}: {
  userId: string
  adminUser: AdminUser
}) {
  const [users, setUsers] = useState<Profile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "appointments">("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users (would need an API endpoint)
        // For now, using empty arrays
        setUsers([])
        setAppointments([])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push("/")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalUsers: users.length,
    totalPatients: users.filter((u) => u.user_type === "patient").length,
    totalDoctors: users.filter((u) => u.user_type === "doctor").length,
    totalAppointments: appointments.length,
    scheduledAppointments: appointments.filter((a) => a.status === "scheduled").length,
    completedAppointments: appointments.filter((a) => a.status === "completed").length,
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">HealthCare Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsPanel userId={userId} />
            <span className="text-neutral-600">Admin Panel</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "appointments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Appointments
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600">Loading...</p>
            </CardContent>
          </Card>
        ) : activeTab === "overview" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.totalPatients}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalDoctors}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{stats.scheduledAppointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === "users" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-900">User Management</h2>
              <div className="w-64">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            user.user_type === "doctor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(user.created_at || "").toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">Appointment Management</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Patient ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Doctor ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm text-neutral-600">{appointment.patient_id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{appointment.doctor_id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{appointment.reason}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "scheduled"
                              ? "bg-yellow-100 text-yellow-700"
                              : appointment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
