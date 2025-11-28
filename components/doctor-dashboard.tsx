"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import NotificationsPanel from "./notifications-panel"
import DoctorRatings from "./doctor-ratings"
import { Calendar, Clock, User, LogOut, CheckCircle, XCircle, AlertCircle, Home, FileText, Settings, Bell, Users, Activity } from "lucide-react"

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
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function DoctorDashboard({
  userId,
  profile,
}: {
  userId: string
  profile: Profile
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [prescription, setPrescription] = useState("")
  const [cancellationReason, setCancellationReason] = useState("")
  const [currentView, setCurrentView] = useState<"dashboard" | "schedule" | "patients" | "records" | "analytics" | "settings">("dashboard")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState(profile.first_name || "")
  const [editedLastName, setEditedLastName] = useState(profile.last_name || "")
  const router = useRouter()

  useEffect(() => {
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

    fetchAppointments()
  }, [userId])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push("/")
  }

  const openCompleteModal = (appointmentId: string) => {
    setSelectedAppointment(appointmentId)
    setNotes("")
    setPrescription("")
    setShowCompleteModal(true)
  }

  const completeAppointment = async () => {
    if (!selectedAppointment) return

    const updateData: any = { 
      status: "completed",
      notes: notes || undefined,
      prescription: prescription || undefined
    }

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        console.error("Error updating status")
        return
      }

      setAppointments((prev) =>
        prev.map((apt) => 
          (apt._id || apt.id) === selectedAppointment 
            ? { ...apt, status: "completed", notes: notes, prescription: prescription } 
            : apt
        )
      )

      setShowCompleteModal(false)
      setSelectedAppointment(null)
      setNotes("")
      setPrescription("")
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const openCancelModal = (appointmentId: string) => {
    setSelectedAppointment(appointmentId)
    setCancellationReason("")
    setShowCancelModal(true)
  }

  const cancelAppointment = async () => {
    if (!selectedAppointment || !cancellationReason) return

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason,
          cancelled_by: 'doctor'
        })
      })

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) => ((apt._id || apt.id) === selectedAppointment ? { ...apt, status: "cancelled", cancellation_reason: cancellationReason } : apt))
        )
        setShowCancelModal(false)
        setSelectedAppointment(null)
        setCancellationReason("")
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
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
                <p className="text-xs text-slate-500">Doctor Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationsPanel userId={userId} />
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium text-sm">
                  Dr. {profile.first_name} {profile.last_name}
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
            <button 
              onClick={() => setCurrentView("schedule")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "schedule" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
            <button 
              onClick={() => setCurrentView("patients")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "patients" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-5 h-5" />
              Patients
            </button>
            <button 
              onClick={() => setCurrentView("records")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "records" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              Medical Records
            </button>
            <button 
              onClick={() => setCurrentView("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentView === "analytics" ? "text-slate-800 bg-slate-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Activity className="w-5 h-5" />
              Analytics
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
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Today's Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Patients</span>
                <span className="text-sm font-bold text-slate-800">{appointments.filter(a => a.status === "completed").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Pending</span>
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
                  Good day, Dr. {profile.last_name}
                </h2>
                <p className="text-slate-600">Here's your appointment overview for today</p>
              </div>

          {/* Dashboard summary cards */}
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
                <p className="text-sm text-slate-600">Awaiting Consultation</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
                <p className="text-sm text-slate-600">Consultations Done</p>
              </CardContent>
            </Card>
          </div>

          {/* Appointment List */}
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Appointment Schedule</h2>

          {isLoading ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments scheduled</h3>
                <p className="text-slate-600">Your schedule is clear for now</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 mb-12">
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
                              {appointment.profiles ? 
                                `${appointment.profiles.first_name} ${appointment.profiles.last_name}` :
                                `Patient ID: ${appointment.patientId.toString().slice(0, 8)}...`
                              }
                            </h3>
                            {appointment.profiles?.email && (
                              <p className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                {appointment.profiles.email}
                              </p>
                            )}
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{appointment.appointmentDate}</span>
                                <Clock className="w-4 h-4 ml-2" />
                                <span>{appointment.appointmentTime}</span>
                              </div>
                              <p className="text-slate-600 text-sm">
                                <span className="font-medium">Chief Complaint:</span> {appointment.reason}
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
                            {appointment.notes && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-slate-700 text-sm">
                                  <span className="font-medium">Clinical Notes:</span> {appointment.notes}
                                </p>
                              </div>
                            )}
                            {appointment.prescription && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-blue-800 text-sm">
                                  <span className="font-medium">Prescription:</span> {appointment.prescription}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.status === "scheduled" && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-slate-800 hover:bg-slate-900 text-white"
                            onClick={() => openCompleteModal(appointment._id || appointment.id || "")}
                          >
                            Complete Visit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCancelModal(appointment._id || appointment.id || "")}
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

              {/* Doctor Ratings Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Patient Feedback & Ratings</h2>
                <DoctorRatings userId={userId} />
              </div>
            </>
          )}

          {/* Schedule View */}
          {currentView === "schedule" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Schedule</h2>
                <p className="text-slate-600">View your appointment schedule</p>
              </div>

              <div className="grid gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                  const dayAppointments = appointments.filter(apt => apt.status === "scheduled")
                  return (
                    <Card key={day} className="border-slate-200 shadow-sm bg-white">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 text-lg mb-4">{day}</h3>
                        {dayAppointments.length > 0 ? (
                          <div className="space-y-2">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div key={apt._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Clock className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium">{apt.appointmentTime}</span>
                                <span className="text-sm text-slate-600">
                                  {apt.profiles ? `${apt.profiles.first_name} ${apt.profiles.last_name}` : "Patient"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">No appointments scheduled</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Patients View */}
          {currentView === "patients" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Patients</h2>
                <p className="text-slate-600">View all your patients</p>
              </div>

              <div className="space-y-4">
                {Array.from(new Set(appointments.map(apt => apt.patientId))).map((patientId) => {
                  const patientAppts = appointments.filter(apt => apt.patientId === patientId)
                  const latestAppt = patientAppts[0]
                  return (
                    <Card key={patientId} className="border-slate-200 shadow-sm bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-lg">
                              {latestAppt.profiles ? 
                                `${latestAppt.profiles.first_name} ${latestAppt.profiles.last_name}` :
                                `Patient ${patientId.slice(0, 8)}`
                              }
                            </h3>
                            {latestAppt.profiles?.email && (
                              <p className="text-slate-500 text-sm">{latestAppt.profiles.email}</p>
                            )}
                            <div className="mt-2 flex gap-4 text-sm">
                              <span className="text-slate-600">
                                Total Visits: <span className="font-medium">{patientAppts.length}</span>
                              </span>
                              <span className="text-slate-600">
                                Completed: <span className="font-medium">{patientAppts.filter(a => a.status === "completed").length}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Medical Records View */}
          {currentView === "records" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Medical Records</h2>
                <p className="text-slate-600">Access patient medical records</p>
              </div>

              <div className="space-y-4">
                {appointments.filter(apt => apt.status === "completed" && (apt.prescription || apt.notes)).map((appointment) => (
                  <Card key={appointment._id || appointment.id} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg">
                            {appointment.profiles ? 
                              `${appointment.profiles.first_name} ${appointment.profiles.last_name}` :
                              "Patient"
                            }
                          </h3>
                          <p className="text-slate-500 text-sm">{appointment.appointmentDate} - {appointment.reason}</p>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                          <h4 className="font-semibold text-slate-800 mb-2">Clinical Notes</h4>
                          <p className="text-slate-700 text-sm">{appointment.notes}</p>
                        </div>
                      )}
                      
                      {appointment.prescription && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Prescription</h4>
                          <p className="text-blue-800 text-sm whitespace-pre-wrap">{appointment.prescription}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {currentView === "analytics" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Analytics</h2>
                <p className="text-slate-600">View your performance metrics</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Appointment Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Appointments</span>
                        <span className="font-bold text-slate-900">{appointments.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completed</span>
                        <span className="font-bold text-emerald-600">{appointments.filter(a => a.status === "completed").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scheduled</span>
                        <span className="font-bold text-amber-600">{appointments.filter(a => a.status === "scheduled").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cancelled</span>
                        <span className="font-bold text-red-600">{appointments.filter(a => a.status === "cancelled").length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Patient Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Patients</span>
                        <span className="font-bold text-slate-900">
                          {new Set(appointments.map(a => a.patientId)).size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completion Rate</span>
                        <span className="font-bold text-emerald-600">
                          {appointments.length > 0 
                            ? Math.round((appointments.filter(a => a.status === "completed").length / appointments.length) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                          <p className="text-slate-900 mt-1">Dr. {profile.first_name} {profile.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Email</label>
                          <p className="text-slate-900 mt-1">{profile.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">User Type</label>
                          <p className="text-slate-900 mt-1">Doctor</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Availability</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Monday - Friday</span>
                        <span className="text-slate-900 font-medium">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Saturday</span>
                        <span className="text-slate-900 font-medium">10:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Sunday</span>
                        <span className="text-red-600 font-medium">Closed</span>
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
                        className="w-full justify-start border-slate-300"
                        onClick={() => alert('Availability management coming soon!')}
                      >
                        Manage Availability
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Complete Appointment Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Complete Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter clinical notes, diagnosis, observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] border-slate-300 focus:border-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription" className="text-slate-700 font-medium">Prescription</Label>
              <Textarea
                id="prescription"
                placeholder="Enter prescription details, medications, dosage instructions..."
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="min-h-[120px] border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button onClick={completeAppointment} className="bg-slate-800 hover:bg-slate-900">
              Complete Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason" className="text-slate-700 font-medium">Cancellation Reason</Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a reason for cancelling this appointment..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[120px] border-slate-300 focus:border-slate-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)} className="border-slate-300">
              Keep Appointment
            </Button>
            <Button 
              onClick={cancelAppointment} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!cancellationReason}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
