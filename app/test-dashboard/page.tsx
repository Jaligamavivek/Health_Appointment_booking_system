"use client"

import { useState } from "react"
import PatientDashboard from "@/components/patient-dashboard"
import DoctorDashboard from "@/components/doctor-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDashboard() {
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient')
  
  const mockProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    first_name: userType === 'patient' ? 'John' : 'Dr. Sarah',
    last_name: userType === 'patient' ? 'Doe' : 'Wilson',
    email: `${userType}@test.com`
  }

  return (
    <div>
      {/* Test Controls */}
      <div className="p-4 bg-yellow-100 border-b">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-800">🧪 Test Dashboard (No Authentication Required)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              This page lets you test all features without authentication issues.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setUserType('patient')}
                variant={userType === 'patient' ? 'default' : 'outline'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                👤 Test as Patient
              </Button>
              <Button 
                onClick={() => setUserType('doctor')}
                variant={userType === 'doctor' ? 'default' : 'outline'}
                className="bg-green-600 hover:bg-green-700"
              >
                👨‍⚕️ Test as Doctor
              </Button>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              Current user: <strong>{mockProfile.first_name} {mockProfile.last_name}</strong> ({userType})
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Content */}
      {userType === 'patient' ? (
        <PatientDashboard userId={mockProfile.id} profile={mockProfile} />
      ) : (
        <DoctorDashboard userId={mockProfile.id} profile={mockProfile} />
      )}
    </div>
  )
}