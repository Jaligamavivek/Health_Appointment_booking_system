import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const DB_FILE = path.join(process.cwd(), 'data', 'database.json')

interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'patient' | 'doctor'
  createdAt: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
  availableDays: string
  availableTime: string
}

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled'
  notes?: string
  checkInTime?: string
  checkOutTime?: string
  createdAt: string
}

interface Feedback {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  rating: number
  review?: string
  createdAt: string
}

interface Database {
  users: User[]
  doctors: Doctor[]
  appointments: Appointment[]
  feedback: Feedback[]
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readDatabase(): Database {
  ensureDataDir()
  
  if (!fs.existsSync(DB_FILE)) {
    const initialData: Database = {
      users: [],
      doctors: [
        {
          id: '1',
          name: 'Dr. Ananya Sharma',
          specialization: 'Cardiologist',
          availableDays: 'Mon-Fri',
          availableTime: '09:00-17:00',
        },
        {
          id: '2',
          name: 'Dr. Rajesh Kumar',
          specialization: 'Dermatologist',
          availableDays: 'Mon-Sat',
          availableTime: '08:00-16:00',
        },
        {
          id: '3',
          name: 'Dr. Priya Patel',
          specialization: 'Pediatrician',
          availableDays: 'Tue-Sat',
          availableTime: '10:00-18:00',
        },
        {
          id: '4',
          name: 'Dr. Amit Singh',
          specialization: 'Orthopedic',
          availableDays: 'Mon-Fri',
          availableTime: '09:00-15:00',
        },
        {
          id: '5',
          name: 'Dr. Kavya Reddy',
          specialization: 'Gynecologist',
          availableDays: 'Mon-Wed,Fri',
          availableTime: '11:00-19:00',
        },
      ],
      appointments: [],
      feedback: [],
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
  
  const data = fs.readFileSync(DB_FILE, 'utf8')
  return JSON.parse(data)
}

function writeDatabase(data: Database) {
  ensureDataDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export class SimpleDatabase {
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const db = readDatabase()
    
    // Check if user already exists
    const existingUser = db.users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    const user: User = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
    }
    
    db.users.push(user)
    writeDatabase(db)
    return user
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const db = readDatabase()
    return db.users.find(u => u.email === email) || null
  }

  static async findUserById(id: string): Promise<User | null> {
    const db = readDatabase()
    return db.users.find(u => u.id === id) || null
  }

  static async getAllDoctors(): Promise<Doctor[]> {
    const db = readDatabase()
    return db.doctors
  }

  static async findDoctorById(id: string): Promise<Doctor | null> {
    const db = readDatabase()
    return db.doctors.find(d => d.id === id) || null
  }

  static async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const db = readDatabase()
    
    const appointment: Appointment = {
      id: generateId(),
      ...appointmentData,
      createdAt: new Date().toISOString(),
    }
    
    db.appointments.push(appointment)
    writeDatabase(db)
    return appointment
  }

  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const db = readDatabase()
    return db.appointments.filter(a => a.patientId === patientId)
  }

  static async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const db = readDatabase()
    return db.appointments.filter(a => a.doctorId === doctorId)
  }

  static async updateAppointment(id: string, update: Partial<Appointment>): Promise<void> {
    const db = readDatabase()
    const index = db.appointments.findIndex(a => a.id === id)
    if (index !== -1) {
      db.appointments[index] = { ...db.appointments[index], ...update }
      writeDatabase(db)
    }
  }

  static async findAppointmentById(id: string): Promise<Appointment | null> {
    const db = readDatabase()
    return db.appointments.find(a => a.id === id) || null
  }

  static async createFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const db = readDatabase()
    
    const feedback: Feedback = {
      id: generateId(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
    }
    
    db.feedback.push(feedback)
    writeDatabase(db)
    return feedback
  }

  static async getFeedbackByDoctor(doctorId: string): Promise<Feedback[]> {
    const db = readDatabase()
    return db.feedback.filter(f => f.doctorId === doctorId)
  }
}