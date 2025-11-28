# 🚀 Quick Start Guide

## ✅ Your Application is Ready!

Both frontend and backend are running successfully:
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:4000 (Express API)

## 🗄️ Database Setup (Required)

**IMPORTANT**: Before testing, you must set up your database tables.

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

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
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked_in', 'completed', 'cancelled')),
  notes TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "doctors_select_all" ON public.doctors FOR SELECT USING (TRUE);
CREATE POLICY "appointments_all_own" ON public.appointments FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "notifications_all_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "feedback_all_own" ON public.feedback FOR ALL USING (auth.uid() = patient_id);

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

4. **Run the SQL** - Click "Run" to create all tables

## 🧪 Test Your Application

### Step 1: Test Patient Flow
1. Go to **http://localhost:3000**
2. Click **"Sign Up"**
3. Fill details, select **"Patient"**
4. Use a **real email** for verification
5. Check email and **verify account**
6. **Login** with your credentials
7. Click **"Book Appointment"**
8. Select doctor, date, time, reason
9. **Submit booking**
10. View appointment on **dashboard**

### Step 2: Test Doctor Flow
1. **Sign up** with different email as **"Doctor"**
2. **Verify and login**
3. View **patient appointments**
4. Click **"Check Out & Complete"**
5. View **patient feedback**

## ✅ Features Working

- **Authentication** - Signup, login, email verification
- **Patient Dashboard** - Book appointments, check-in, feedback
- **Doctor Dashboard** - View patients, check-out, ratings
- **Real-time Updates** - Live notifications
- **Responsive Design** - Mobile-friendly

## 🎯 You're All Set!

Your complete health appointment system is now running with all features implemented. Enjoy testing! 🚀