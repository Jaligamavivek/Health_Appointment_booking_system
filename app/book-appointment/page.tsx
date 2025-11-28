"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function BookAppointmentPage() {
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [reason, setReason] = useState("")
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Fetch doctors from API
  async function fetchDoctors() {
    setLoading(true)
    try {
      const response = await fetch('/api/doctors')
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }
      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setError("Failed to load doctors")
    }
    setLoading(false)
  }

  // Handle booking
  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!appointmentDate || !appointmentTime || !doctorId || !reason) {
      setError("All fields are required!")
      return
    }

    setSubmitting(true)

    try {
      // Get current user from API
      const userResponse = await fetch('/api/auth/me')
      if (!userResponse.ok) {
        setError("You must be logged in to book an appointment")
        router.push("/auth/login")
        return
      }
      
      const userData = await userResponse.json()
      const user = userData.user

      // Create appointment using the API route
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: user.id,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason: reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Booking error:", errorData)
        throw new Error(errorData.error || "Failed to book appointment")
      }

      alert("✅ Appointment booked successfully!")
      setAppointmentDate("")
      setAppointmentTime("")
      setDoctorId("")
      setReason("")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error booking appointment:", err)
      setError(err.message || "Failed to book appointment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-slate-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">HealthCare</h1>
                <p className="text-xs text-slate-500">Book Appointment</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-slate-300 hover:bg-slate-50"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-start py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">
            Schedule Your Appointment
          </h2>
          <p className="text-slate-600 text-lg">
            Choose your preferred doctor and time slot
          </p>
        </div>

        {/* Booking Form */}
        <Card className="w-full max-w-2xl shadow-xl border-slate-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Appointment Details
            </CardTitle>
            <CardDescription className="text-slate-600">
              Fill in the information below to book your consultation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-700 font-medium">Appointment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="h-11 border-slate-300 focus:border-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-slate-700 font-medium">Appointment Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                    className="h-11 border-slate-300 focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-slate-700 font-medium">Select Healthcare Provider</Label>
                {loading ? (
                  <div className="h-11 border border-slate-300 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500 text-sm">Loading doctors...</span>
                  </div>
                ) : (
                  <Select value={doctorId} onValueChange={setDoctorId} required>
                    <SelectTrigger className="w-full h-11 border-slate-300">
                      <SelectValue placeholder="Choose your doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc._id || doc.id} value={(doc._id || doc.id)?.toString() || ''}>
                          <div className="flex flex-col">
                            <span className="font-medium">{doc.name}</span>
                            <span className="text-xs text-slate-500">{doc.specialization}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-slate-700 font-medium">Chief Complaint / Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe your symptoms or the reason for your appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="min-h-[120px] border-slate-300 focus:border-slate-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 border-slate-300 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  disabled={submitting || loading}
                >
                  {submitting ? "Booking..." : "Confirm Appointment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 w-full max-w-2xl">
          <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Flexible Scheduling</h3>
              <p className="text-sm text-slate-600">Choose your preferred time</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Expert Doctors</h3>
              <p className="text-sm text-slate-600">Qualified professionals</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Reminders</h3>
              <p className="text-sm text-slate-600">Never miss appointments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}