import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: Request) {
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

    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = await request.json()

    // Validate that patient_id matches the authenticated user
    if (patient_id !== payload.userId) {
      return NextResponse.json({ error: "Patient ID does not match authenticated user" }, { status: 403 })
    }

    // Check if doctor exists
    const doctor = await DatabaseService.findDoctorById(doctor_id)
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Create appointment
    const appointment = await DatabaseService.createAppointment({
      patientId: patient_id,
      doctorId: doctor_id,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      reason,
      status: "scheduled",
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Appointment creation error:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

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

    // Get appointments based on user type
    let appointments
    if (payload.userType === 'patient') {
      appointments = await DatabaseService.getAppointmentsByPatient(payload.userId)
      
      // Add doctor information to each appointment
      const appointmentsWithDoctors = await Promise.all(
        appointments.map(async (appointment: any) => {
          try {
            const doctor = await DatabaseService.findDoctorById(appointment.doctorId.toString())
            return {
              ...appointment,
              doctors: doctor ? { name: doctor.name, specialization: doctor.specialization } : null
            }
          } catch (error) {
            console.error("Error fetching doctor for appointment:", error)
            return appointment
          }
        })
      )
      
      return NextResponse.json(appointmentsWithDoctors)
    } else {
      // For doctors, first find their doctor record by user ID
      console.log("Looking for doctor with user ID:", payload.userId)
      const doctor = await DatabaseService.findDoctorByUserId(payload.userId)
      console.log("Found doctor:", doctor)
      
      if (doctor && doctor._id) {
        console.log("Getting appointments for doctor ID:", doctor._id.toString())
        appointments = await DatabaseService.getAppointmentsByDoctor(doctor._id.toString())
        console.log("Found appointments:", appointments.length)
        
        // Add patient information to each appointment
        const appointmentsWithPatients = await Promise.all(
          appointments.map(async (appointment: any) => {
            try {
              const patient = await DatabaseService.findUserById(appointment.patientId.toString())
              return {
                ...appointment,
                profiles: patient ? { 
                  first_name: patient.firstName, 
                  last_name: patient.lastName,
                  email: patient.email 
                } : null
              }
            } catch (error) {
              console.error("Error fetching patient for appointment:", error)
              return appointment
            }
          })
        )
        
        return NextResponse.json(appointmentsWithPatients)
      } else {
        console.log("No doctor found for user ID:", payload.userId)
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error("Get appointments error:", error)
    return NextResponse.json({ error: "Failed to get appointments" }, { status: 500 })
  }
}
