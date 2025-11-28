"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Calendar, Clock, User, LogOut, Plus, CheckCircle, XCircle, AlertCircle, Home, FileText, Settings, Bell } from "lucide-react"

// Feedback Form Component
function FeedbackForm({ appointmentId, onSubmit }: { appointmentId: string, onSubmit: (appointmentId: string, rating: number, review: string) => void }) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating")
      return
    }
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit(appointmentId, rating, review)
      setSuccess(true)
      setRating(0)
      setReview("")
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Thank you for your feedback!
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl">
      <h4 className="font-semibold text-slate-800 mb-3">Rate your experience</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl ${star <= rating ? 'text-amber-400' : 'text-slate-300'} hover:text-amber-400 transition-colors hover:scale-110 transform`}
            >
              ★
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your experience with this doctor (optional)..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="min-h-[100px] border-slate-300 focus:border-slate-500"
        />
        {error && (
          <p className="text-red-600 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting} className="bg-slate-800 hover:bg-slate-900">
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </div>
  )
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface Appointment {
  _id: string
  id?: string
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: string
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  hasFeedback?: boolean
  doctors?: {
    name: string
    specialization: string
  }
}

export default function PatientDashboard({
  userId,
  profile,
}: {
  userId: string
  profile: Profile
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch appointments for logged-in patient
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/appointments')
        if (response.ok) {
          const appointmentsData = await response.json()
          
          // Check feedback status for completed appointments
          const appointmentsWithFeedback = await Promise.all(
            (appointmentsData || []).map(async (appointment: Appointment) => {
              if (appointment.status === 'completed') {
                try {
                  const feedbackResponse = await fetch(`/api/feedback/check?appointment_id=${appointment._id}`)
                  const hasFeedback = feedbackResponse.ok && (await feedbackResponse.json()).exists
                  return { ...appointment, hasFeedback }
                } catch (error) {
                  console.error("Error checking feedback:", error)
                  return { ...appointment, hasFeedback: false }
                }
              }
              return appointment
            })
          )
          
          setAppointments(appointmentsWithFeedback)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
      setIsLoading(false)
    }

    fetchAppointments()
  }, [userId])

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) => ((apt._id || apt.id) === appointmentId ? { ...apt, status: "cancelled" } : apt))
        )
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  // ✅ Submit feedback for completed appointment
  const submitFeedback = async (appointmentId: string, rating: number, review: string) => {
    const appointment = appointments.find(apt => (apt._id || apt.id) === appointmentId)
    if (!appointment) {
      throw new Error("Appointment not found")
    }

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        doctor_id: appointment.doctorId,
        rating,
        review,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to submit feedback")
    }

    // Update the appointment to mark feedback as submitted
    setAppointments(prev => 
      prev.map(apt => 
        (apt._id || apt.id) === appointmentId 
          ? { ...apt, hasFeedback: true }
          : apt
      )
    )

    return response.json()
  }

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = "/"
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">HealthCare</h1>
                <p className="text-xs text-slate-500">Patient Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/book-appointment">
                <Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium text-sm">
                  {profile.first_name} {profile.last_name}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-slate-300 hover:bg-slate-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-800 bg-slate-100 rounded-lg font-medium transition-colors">
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <Link href="/book-appointment" className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <button 
              onClick={() => alert('Medical Records feature coming soon!')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              Medical Records
            </button>
            <button 
              onClick={() => alert('Notifications feature coming soon!')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button 
              onClick={() => alert('Settings feature coming soon!')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Visits</span>
                <span className="text-sm font-bold text-slate-800">{appointments.filter(a => a.status === "completed").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Upcoming</span>
                <span className="text-sm font-bold text-slate-800">{appointments.filter(a => a.status === "scheduled").length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {profile.first_name}
            </h2>
            <p className="text-slate-600">Here's an overview of your healthcare appointments</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-slate-700" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Today</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {appointments.filter((a) => a.appointmentDate === today).length}
                </p>
                <p className="text-sm text-slate-600">Appointments Today</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </p>
                <p className="text-sm text-slate-600">Upcoming Visits</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">History</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
                <p className="text-sm text-slate-600">Completed Visits</p>
              </CardContent>
            </Card>
          </div>

          {/* Appointment List */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Your Appointments</h2>
            <Link href="/book-appointment">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                <Plus className="w-4 h-4 mr-2" />
                Schedule New
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your appointments...</p>
              </CardContent>
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments yet</h3>
                <p className="text-slate-600 mb-6">Start your healthcare journey by booking your first appointment</p>
                <Link href="/book-appointment">
                  <Button className="bg-slate-800 hover:bg-slate-900">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment._id || appointment.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">
                              {appointment.doctors?.name || "Doctor"}
                              {appointment.doctors?.specialization && (
                                <span className="text-slate-500 font-normal text-sm ml-2">
                                  • {appointment.doctors.specialization}
                                </span>
                              )}
                            </h3>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{appointment.appointmentDate}</span>
                                <Clock className="w-4 h-4 ml-2" />
                                <span>{appointment.appointmentTime}</span>
                              </div>
                              <p className="text-slate-600 text-sm">
                                <span className="font-medium">Reason:</span> {appointment.reason}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                  appointment.status === "scheduled"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : appointment.status === "checked_in"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : appointment.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {appointment.status === "scheduled" && <Clock className="w-3 h-3" />}
                                {appointment.status === "checked_in" && <AlertCircle className="w-3 h-3" />}
                                {appointment.status === "completed" && <CheckCircle className="w-3 h-3" />}
                                {appointment.status === "cancelled" && <XCircle className="w-3 h-3" />}
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            {appointment.checkInTime && (
                              <p className="text-slate-500 text-xs mt-2">
                                Checked in: {new Date(appointment.checkInTime).toLocaleString()}
                              </p>
                            )}
                            {appointment.checkOutTime && (
                              <p className="text-slate-500 text-xs mt-1">
                                Checked out: {new Date(appointment.checkOutTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {appointment.status === "completed" && !appointment.hasFeedback && (
                          <FeedbackForm 
                            appointmentId={appointment._id || appointment.id || ""}
                            onSubmit={submitFeedback}
                          />
                        )}

                        {appointment.status === "completed" && appointment.hasFeedback && (
                          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Feedback submitted - Thank you!
                            </p>
                          </div>
                        )}
                      </div>

                      {appointment.status === "scheduled" && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => checkInAppointment(appointment._id || appointment.id || "")}
                            className="bg-slate-800 hover:bg-slate-900 text-white"
                          >
                            Check In
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelAppointment(appointment._id || appointment.id || "")}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
