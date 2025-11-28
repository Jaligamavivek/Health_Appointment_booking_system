import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, userType } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await DatabaseService.findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await DatabaseService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType,
    })

    // If user is a doctor, also create a doctor record with user ID link
    if (userType === 'doctor') {
      await DatabaseService.createDoctorWithUserId({
        userId: user._id.toString(),
        name: `Dr. ${firstName} ${lastName}`,
        specialization: 'General Practice', // Default specialization
        availableDays: 'Mon-Fri',
        availableTime: '09:00-17:00',
      })
    }

    // Generate token
    const token = generateToken(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}