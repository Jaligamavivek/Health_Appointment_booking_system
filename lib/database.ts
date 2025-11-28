import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'patient' | 'doctor'
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  _id?: ObjectId
  id?: string
  userId?: string
  name: string
  specialization: string
  availableDays: string
  availableTime: string
  createdAt: Date
}

export interface Appointment {
  _id?: ObjectId
  patientId: ObjectId
  doctorId: ObjectId
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled'
  notes?: string
  checkInTime?: Date
  checkOutTime?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Feedback {
  _id?: ObjectId
  appointmentId: ObjectId
  patientId: ObjectId
  doctorId: ObjectId
  rating: number
  review?: string
  createdAt: Date
}

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db('healthcare')
  }

  // Users
  static async createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await this.getDb()
    const newUser = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection('users').insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb()
    return db.collection('users').findOne({ email })
  }

  static async findUserById(id: string): Promise<User | null> {
    const db = await this.getDb()
    return db.collection('users').findOne({ _id: new ObjectId(id) })
  }

  static async updateUserProfile(id: string, updates: { firstName?: string, lastName?: string }): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  // Doctors
  static async getAllDoctors(): Promise<Doctor[]> {
    const db = await this.getDb()
    const doctors = await db.collection('doctors').find({}).toArray()
    // Ensure each doctor has both _id and id for compatibility
    return doctors.map(doc => ({
      ...doc,
      id: doc._id?.toString() || doc.id
    }))
  }

  static async findDoctorById(id: string): Promise<Doctor | null> {
    const db = await this.getDb()
    try {
      // Try to find by ObjectId first
      return await db.collection('doctors').findOne({ _id: new ObjectId(id) })
    } catch (error) {
      // If ObjectId conversion fails, try finding by string id
      return await db.collection('doctors').findOne({ id: id })
    }
  }

  static async findDoctorByUserId(userId: string): Promise<Doctor | null> {
    const db = await this.getDb()
    return await db.collection('doctors').findOne({ userId: userId }) as Promise<Doctor | null>
  }

  static async createDoctor(doctor: Omit<Doctor, '_id' | 'createdAt'>): Promise<Doctor> {
    const db = await this.getDb()
    const newDoctor = {
      ...doctor,
      createdAt: new Date(),
    }
    const result = await db.collection('doctors').insertOne(newDoctor)
    return { ...newDoctor, _id: result.insertedId }
  }

  static async createDoctorWithUserId(doctor: Omit<Doctor, '_id' | 'id' | 'createdAt'>): Promise<Doctor> {
    const db = await this.getDb()
    const newDoctor = {
      ...doctor,
      createdAt: new Date(),
    }
    const result = await db.collection('doctors').insertOne(newDoctor)
    return { ...newDoctor, _id: result.insertedId }
  }

  static async findDoctorByUserId(userId: string): Promise<Doctor | null> {
    const db = await this.getDb()
    return db.collection('doctors').findOne({ userId: userId })
  }

  // Appointments
  static async createAppointment(appointment: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const db = await this.getDb()
    const newAppointment = {
      ...appointment,
      patientId: new ObjectId(appointment.patientId),
      doctorId: new ObjectId(appointment.doctorId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection('appointments').insertOne(newAppointment)
    return { ...newAppointment, _id: result.insertedId }
  }

  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const db = await this.getDb()
    return db.collection('appointments').find({ patientId: new ObjectId(patientId) }).sort({ appointmentDate: 1 }).toArray()
  }

  static async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const db = await this.getDb()
    return db.collection('appointments').find({ doctorId: new ObjectId(doctorId) }).sort({ appointmentDate: 1 }).toArray()
  }

  static async updateAppointment(id: string, update: Partial<Appointment>): Promise<void> {
    const db = await this.getDb()
    await db.collection('appointments').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } }
    )
  }

  static async findAppointmentById(id: string): Promise<Appointment | null> {
    const db = await this.getDb()
    return db.collection('appointments').findOne({ _id: new ObjectId(id) }) as Promise<Appointment | null>
  }

  // Feedback
  static async createFeedback(feedback: Omit<Feedback, '_id' | 'createdAt'>): Promise<Feedback> {
    const db = await this.getDb()
    const newFeedback = {
      ...feedback,
      appointmentId: new ObjectId(feedback.appointmentId),
      patientId: new ObjectId(feedback.patientId),
      doctorId: new ObjectId(feedback.doctorId),
      createdAt: new Date(),
    }
    const result = await db.collection('feedback').insertOne(newFeedback)
    return { ...newFeedback, _id: result.insertedId }
  }

  static async getFeedbackByDoctor(doctorId: string): Promise<Feedback[]> {
    const db = await this.getDb()
    return db.collection('feedback').find({ doctorId: new ObjectId(doctorId) }).sort({ createdAt: -1 }).toArray() as Promise<Feedback[]>
  }

  static async getFeedbackByAppointment(appointmentId: string): Promise<Feedback | null> {
    const db = await this.getDb()
    return db.collection('feedback').findOne({ appointmentId: new ObjectId(appointmentId) }) as Promise<Feedback | null>
  }

  // Initialize sample data
  static async initializeSampleData(): Promise<void> {
    const db = await this.getDb()

    // Check if doctors already exist
    const doctorCount = await db.collection('doctors').countDocuments()
    if (doctorCount === 0) {
      const sampleDoctors = [
        {
          name: 'Dr. Ananya Sharma',
          specialization: 'Cardiologist',
          availableDays: 'Mon-Fri',
          availableTime: '09:00-17:00',
          createdAt: new Date(),
        },
        {
          name: 'Dr. Rajesh Kumar',
          specialization: 'Dermatologist',
          availableDays: 'Mon-Sat',
          availableTime: '08:00-16:00',
          createdAt: new Date(),
        },
        {
          name: 'Dr. Priya Patel',
          specialization: 'Pediatrician',
          availableDays: 'Tue-Sat',
          availableTime: '10:00-18:00',
          createdAt: new Date(),
        },
        {
          name: 'Dr. Amit Singh',
          specialization: 'Orthopedic',
          availableDays: 'Mon-Fri',
          availableTime: '09:00-15:00',
          createdAt: new Date(),
        },
        {
          name: 'Dr. Kavya Reddy',
          specialization: 'Gynecologist',
          availableDays: 'Mon-Wed,Fri',
          availableTime: '11:00-19:00',
          createdAt: new Date(),
        },
      ]

      await db.collection('doctors').insertMany(sampleDoctors)
      console.log('Sample doctors created')
    }
  }
}