# 🔧 Simple Authentication Setup (No Email Verification)

## Issue: Can't signup/signin due to email verification

## 🚀 Quick Fix

### Step 1: Disable Email Confirmation in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Find **"Enable email confirmations"**
4. **Turn it OFF** (disable it)
5. **Save** the settings

### Step 2: Set up Database Tables

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  available_days TEXT,
  available_time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(appointment_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample doctors
INSERT INTO public.doctors (name, specialization, available_days, available_time) VALUES
('Dr. Ananya Sharma', 'Cardiologist', 'Mon-Fri', '09:00-17:00'),
('Dr. Rajesh Kumar', 'Dermatologist', 'Mon-Sat', '08:00-16:00'),
('Dr. Priya Patel', 'Pediatrician', 'Tue-Sat', '10:00-18:00'),
('Dr. Amit Singh', 'Orthopedic', 'Mon-Fri', '09:00-15:00'),
('Dr. Kavya Reddy', 'Gynecologist', 'Mon-Wed,Fri', '11:00-19:00')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Enable all for authenticated users" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable read for all users" ON public.doctors FOR SELECT USING (TRUE);
CREATE POLICY "Enable all for authenticated users" ON public.appointments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated users" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated users" ON public.feedback FOR ALL USING (auth.uid() IS NOT NULL);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Test the Authentication

### Test Patient Account:
1. Go to **http://localhost:3000/auth/sign-up**
2. Fill in:
   - First Name: **John**
   - Last Name: **Doe**
   - User Type: **Patient**
   - Email: **patient@test.com**
   - Password: **password123**
3. Click **"Create Account"**
4. You should see success message
5. Go to **Login** and use the same credentials

### Test Doctor Account:
1. Use different email: **doctor@test.com**
2. Select **Doctor** as user type
3. Same process as above

## ✅ Expected Results

- ✅ **No email verification required**
- ✅ **Immediate account creation**
- ✅ **Direct login after signup**
- ✅ **Dashboard access right away**

## 🔧 If Still Having Issues

1. **Clear browser cache** and cookies
2. **Check Supabase Auth settings** (email confirmation OFF)
3. **Run the SQL setup** in Supabase
4. **Try incognito/private browsing**

This setup removes all email verification requirements and allows immediate signup and login!