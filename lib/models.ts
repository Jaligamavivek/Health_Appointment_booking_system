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

export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  appointmentId?: ObjectId
  type: string
  message: string
  read: boolean
  createdAt: Date
}