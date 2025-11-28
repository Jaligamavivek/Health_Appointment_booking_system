# 🧪 Create Test Users

## Quick Test Users Setup

If you're still having authentication issues, you can create test users directly in the database.

### Step 1: Run this SQL in Supabase SQL Editor

```sql
-- Create test patient user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'patient@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "John", "last_name": "Doe", "user_type": "patient"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create test doctor user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'doctor@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Dr. Sarah", "last_name": "Wilson", "user_type": "doctor"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users
INSERT INTO public.profiles (id, first_name, last_name, email, user_type) VALUES
('11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'patient@test.com', 'patient'),
('22222222-2222-2222-2222-222222222222', 'Dr. Sarah', 'Wilson', 'doctor@test.com', 'doctor')
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Test Login

Now you can login with these credentials:

**Patient Account:**
- Email: `patient@test.com`
- Password: `password123`

**Doctor Account:**
- Email: `doctor@test.com`
- Password: `password123`

## 🎯 Alternative: Simple Manual Setup

If the above doesn't work, here's the simplest approach:

### 1. Disable All Authentication (For Testing)

Update your `middleware.ts` to allow all access:

```typescript
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Temporarily disable auth for testing
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
```

### 2. Create a Test Dashboard

Create `app/test-dashboard/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import PatientDashboard from "@/components/patient-dashboard"
import DoctorDashboard from "@/components/doctor-dashboard"
import { Button } from "@/components/ui/button"

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
      <div className="p-4 bg-yellow-100 border-b">
        <h1 className="text-xl font-bold">Test Dashboard</h1>
        <div className="flex gap-2 mt-2">
          <Button 
            onClick={() => setUserType('patient')}
            variant={userType === 'patient' ? 'default' : 'outline'}
          >
            Test as Patient
          </Button>
          <Button 
            onClick={() => setUserType('doctor')}
            variant={userType === 'doctor' ? 'default' : 'outline'}
          >
            Test as Doctor
          </Button>
        </div>
      </div>
      
      {userType === 'patient' ? (
        <PatientDashboard userId={mockProfile.id} profile={mockProfile} />
      ) : (
        <DoctorDashboard userId={mockProfile.id} profile={mockProfile} />
      )}
    </div>
  )
}
```

### 3. Access Test Dashboard

Go to: `http://localhost:3000/test-dashboard`

This bypasses all authentication and lets you test the full application functionality!

## 🔄 Re-enable Authentication Later

Once everything is working, you can re-enable proper authentication by:
1. Restoring the original `middleware.ts`
2. Following the proper Supabase auth setup
3. Removing the test dashboard

This approach lets you test all features immediately without authentication issues!