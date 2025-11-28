"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Calendar, Clock, User, LogOut, Plus, CheckCircle, XCircle, Home, FileText, Settings, Bell, Star, Stethoscope, Award, MessageSquare } from "lucide-react"

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
  notes?: string
  prescription?: string
  cancellation_reason?: string
  cancelled_by?: string
  hasFeedback?: boolean
  doctors?: {
    name: string
    specialization: string
    rating?: number
    totalReviews?: number
  }
}

interface DoctorDetails {
  name: string
  specialization: string
  rating: number
  totalReviews: number
  totalTreatments?: number
  reviews: Array<{
    patientName: string
    rating: number
    review: string
    date: string
  }>
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
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all")
  const [currentView, setCurrentView] = useState<"dashboard" | "medical-records" | "notifications" | "settings">("dashboard")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState(profile.first_name || "")
  const [editedLastName, setEditedLastName] = useState(profile.last_name || "")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsReminders, setSmsReminders] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [userId])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
    setIsLoading(false)
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellation_reason: 'Cancelled by patient',
          cancelled_by: 'patient'
        })
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

  const viewDoctorDetails = async (doctorId: string, doctorName: string, specialization: string) => {
    try {
      // Fetch doctor ratings and reviews
      const response = await fetch(`/api/feedback/doctor/${doctorId}`)
      
      // Calculate total treatments from appointments
      const totalTreatments = appointments.filter(apt => 
        apt.doctorId === doctorId && apt.status === "completed"
      ).length

      if (response.ok) {
        const data = await response.json()
        setSelectedDoctor({
          name: doctorName,
          specialization: specialization,
          rating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          reviews: data.reviews || [],
          totalTreatments: totalTreatments
        })
        setShowDoctorModal(true)
      } else {
        // If API fails, still show doctor info with local data
        setSelectedDoctor({
          name: doctorName,
          specialization: specialization,
          rating: 0,
          totalReviews: 0,
          reviews: [],
          totalTreatments: totalTreatments
        })
        setShowDoctorModal(true)
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error)
      // Show modal anyway with available data
      const totalTreatments = appointments.filter(apt => 
        apt.doctorId === doctorId && apt.status === "completed"
      ).length
      
      setSelectedDoctor({
        name: doctorName,
        specialization: specialization,
        rating: 0,
        totalReviews: 0,
        reviews: [],
        totalTreatments: totalTreatments
      })
      setShowDoctorModal(true)
    }
  }

  const openReviewModal = (appointmentId: string) => {
    setSelectedAppointmentForReview(appointmentId)
    setReviewRating(0)
    setReviewText("")
    setShowReviewModal(true)
  }

  const submitReview = async () => {
    if (!selectedAppointmentForReview || reviewRating === 0) return

    const appointment = appointments.find(apt => (apt._id || apt.id) === selectedAppointmentForReview)
    if (!appointment) return

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: selectedAppointmentForReview,
          doctor_id: appointment.doctorId,
          rating: reviewRating,
          review: reviewText,
          patient_name: `${profile.first_name} ${profile.last_name}`
        }),
      })

      if (response.ok) {
        setAppointments(prev => 
          prev.map(apt => 
            (apt._id || apt.id) === selectedAppointmentForReview 
              ? { ...apt, hasFeedback: true }
              : apt
          )
        )
        alert('Thank you for your review! Your feedback helps other patients.')
        setShowReviewModal(false)
        setSelectedAppointmentForReview(null)
        setReviewRating(0)
        setReviewText("")
      } else {
        const errorData = await response.json()
        alert(`Failed to submit review: ${errorData.error || 'Please try again'}`)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert('Error submitting review. Please try again.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = "/"
  }

  const today = new Date().toISOString().split("T")[0]

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === "upcoming") return apt.status === "scheduled"
    if (activeTab === "completed") return apt.status === "completed"
    if (activeTab === "cancelled") return apt.status === "cancelled"
    return true
  })

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
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "dashboard" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <Link href="/book-appointment" className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <button 
              onClick={() => setCurrentView("medical-records")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "medical-records" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              Medical Records
            </button>
            <button 
              onClick={() => setCurrentView("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "notifications" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button 
              onClick={() => setCurrentView("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "settings" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
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
          {currentView === "dashboard" && (
            <>
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

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === "all" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500"
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === "upcoming" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === "completed" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === "cancelled" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Appointment List */}
          {isLoading ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your appointments...</p>
              </CardContent>
            </Card>
          ) : filteredAppointments.length === 0 ? (
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
              {filteredAppointments.map((appointment) => (
                <Card key={appointment._id || appointment.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <button
                              onClick={() => appointment.doctors && viewDoctorDetails(
                                appointment.doctorId,
                                appointment.doctors.name,
                                appointment.doctors.specialization
                              )}
                              className="font-semibold text-slate-900 text-lg mb-2 hover:text-slate-600 transition-colors text-left"
                            >
                              {appointment.doctors?.name || "Doctor"}
                              {appointment.doctors?.specialization && (
                                <span className="text-slate-500 font-normal text-sm ml-2">
                                  • {appointment.doctors.specialization}
                                </span>
                              )}
                            </button>
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
                                    : appointment.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {appointment.status === "scheduled" && <Clock className="w-3 h-3" />}
                                {appointment.status === "completed" && <CheckCircle className="w-3 h-3" />}
                                {appointment.status === "cancelled" && <XCircle className="w-3 h-3" />}
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>

                            {/* Prescription Section */}
                            {appointment.status === "completed" && appointment.prescription && (
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Prescription
                                </h4>
                                <p className="text-blue-800 text-sm whitespace-pre-wrap">{appointment.prescription}</p>
                              </div>
                            )}

                            {/* Doctor Notes */}
                            {appointment.status === "completed" && appointment.notes && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-slate-700 text-sm">
                                  <span className="font-medium">Doctor's Notes:</span> {appointment.notes}
                                </p>
                              </div>
                            )}

                            {/* Cancellation Reason */}
                            {appointment.status === "cancelled" && appointment.cancellation_reason && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                  <XCircle className="w-4 h-4" />
                                  Cancellation Reason
                                </h4>
                                <p className="text-red-800 text-sm">{appointment.cancellation_reason}</p>
                                {appointment.cancelled_by && (
                                  <p className="text-red-600 text-xs mt-2">
                                    Cancelled by: {appointment.cancelled_by === 'doctor' ? 'Doctor' : 'You'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.status === "scheduled" && (
                        <div className="flex flex-col gap-2">
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

                      {appointment.status === "completed" && !appointment.hasFeedback && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => openReviewModal(appointment._id || appointment.id || "")}
                            className="bg-slate-800 hover:bg-slate-900 text-white"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Leave Review
                          </Button>
                        </div>
                      )}

                      {appointment.status === "completed" && appointment.hasFeedback && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Review Submitted
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </>
          )}

          {/* Medical Records View */}
          {currentView === "medical-records" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Medical Records</h2>
                <p className="text-slate-600">View your complete medical history and prescriptions</p>
              </div>

              {appointments.filter(apt => apt.status === "completed" && (apt.prescription || apt.notes)).length === 0 ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No medical records yet</h3>
                    <p className="text-slate-600">Your prescriptions and medical notes will appear here after completed appointments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appointments.filter(apt => apt.status === "completed" && (apt.prescription || apt.notes)).map((appointment) => (
                    <Card key={appointment._id || appointment.id} className="border-slate-200 shadow-sm bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-lg">{appointment.doctors?.name}</h3>
                            <p className="text-slate-500 text-sm">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                            <p className="text-slate-600 text-sm mt-1">Reason: {appointment.reason}</p>
                          </div>
                        </div>
                        
                        {appointment.prescription && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Prescription
                            </h4>
                            <p className="text-blue-800 text-sm whitespace-pre-wrap">{appointment.prescription}</p>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2">Clinical Notes</h4>
                            <p className="text-slate-700 text-sm">{appointment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications View */}
          {currentView === "notifications" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Notifications</h2>
                <p className="text-slate-600">Stay updated with your appointment reminders</p>
              </div>

              <div className="space-y-4">
                {appointments.filter(apt => apt.status === "scheduled").map((appointment) => (
                  <Card key={appointment._id || appointment.id} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1">Upcoming Appointment</h3>
                          <p className="text-slate-600 text-sm mb-2">
                            You have an appointment with <span className="font-medium">{appointment.doctors?.name}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {appointment.appointmentDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.appointmentTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {appointments.filter(apt => apt.status === "scheduled").length === 0 && (
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
                      <p className="text-slate-600">You're all caught up! No upcoming appointments.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === "settings" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Settings</h2>
                <p className="text-slate-600">Manage your account and preferences</p>
              </div>

              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-lg">Profile Information</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="border-slate-300"
                      >
                        {isEditingProfile ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">First Name</Label>
                          <input
                            type="text"
                            value={editedFirstName}
                            onChange={(e) => setEditedFirstName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Last Name</Label>
                          <input
                            type="text"
                            value={editedLastName}
                            onChange={(e) => setEditedLastName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                        <Button 
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/auth/update-profile', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  first_name: editedFirstName,
                                  last_name: editedLastName
                                })
                              })
                              
                              if (response.ok) {
                                // Update local profile state
                                profile.first_name = editedFirstName
                                profile.last_name = editedLastName
                                alert('Profile updated successfully!')
                                setIsEditingProfile(false)
                                // Refresh the page to show updated name everywhere
                                window.location.reload()
                              } else {
                                alert('Failed to update profile. Please try again.')
                              }
                            } catch (error) {
                              console.error('Error updating profile:', error)
                              alert('Error updating profile. Please try again.')
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-900"
                        >
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Full Name</label>
                          <p className="text-slate-900 mt-1">{profile.first_name} {profile.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Email</label>
                          <p className="text-slate-900 mt-1">{profile.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">User Type</label>
                          <p className="text-slate-900 mt-1">Patient</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Email Notifications</span>
                        <button
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            emailNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">SMS Reminders</span>
                        <button
                          onClick={() => setSmsReminders(!smsReminders)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            smsReminders ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              smsReminders ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Appointment Reminders</span>
                        <span className="text-emerald-600 font-medium">24 hours before</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-slate-300"
                        onClick={() => alert('Change password feature coming soon!')}
                      >
                        Change Password
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            alert('Account deletion feature coming soon!')
                          }
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Doctor Details Modal */}
      <Dialog open={showDoctorModal} onOpenChange={setShowDoctorModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Doctor Profile</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-10 h-10 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{selectedDoctor.name}</h3>
                  <p className="text-slate-600 mb-3">{selectedDoctor.specialization}</p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedDoctor.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {selectedDoctor.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {selectedDoctor.totalReviews} reviews
                    </span>
                  </div>
                  {selectedDoctor.totalTreatments !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        {selectedDoctor.totalTreatments} Completed Treatments
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Patient Reviews
                </h4>
                {selectedDoctor.reviews.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDoctor.reviews.map((review, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800">{review.patientName}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{review.review}</p>
                        <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-5xl transition-all hover:scale-110 ${
                      star <= reviewRating ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-slate-600">
                  {reviewRating === 5 && "Excellent!"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 1 && "Needs Improvement"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text" className="text-slate-700 font-medium">Your Review (Optional)</Label>
              <Textarea
                id="review-text"
                placeholder="Share your experience with this doctor..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[120px] border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={submitReview} 
              className="bg-slate-800 hover:bg-slate-900"
              disabled={reviewRating === 0}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
