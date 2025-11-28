-- Complete Working Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
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

-- 2. Create doctors table (separate from profiles)
CREATE TABLE IF NOT EXISTS public.doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  available_days TEXT,
  available_time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create appointments table
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

-- 4. Create feedback table
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

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insert sample doctors
INSERT INTO public.doctors (name, specialization, available_days, available_time) VALUES
('Dr. Ananya Sharma', 'Cardiologist', 'Mon-Fri', '09:00-17:00'),
('Dr. Rajesh Kumar', 'Dermatologist', 'Mon-Sat', '08:00-16:00'),
('Dr. Priya Patel', 'Pediatrician', 'Tue-Sat', '10:00-18:00'),
('Dr. Amit Singh', 'Orthopedic', 'Mon-Fri', '09:00-15:00'),
('Dr. Kavya Reddy', 'Gynecologist', 'Mon-Wed,Fri', '11:00-19:00')
ON CONFLICT (id) DO NOTHING;

-- 7. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
DROP POLICY IF EXISTS "appointments_all_own" ON public.appointments;
DROP POLICY IF EXISTS "notifications_all_own" ON public.notifications;
DROP POLICY IF EXISTS "feedback_all_own" ON public.feedback;
DROP POLICY IF EXISTS "doctors_select_all" ON public.doctors;

-- 9. Create simple, working policies
CREATE POLICY "Enable all for authenticated users" ON public.profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON public.appointments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON public.notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON public.feedback
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read for all users" ON public.doctors
  FOR SELECT USING (TRUE);

-- 10. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.feedback TO authenticated;
GRANT SELECT ON public.doctors TO authenticated;
GRANT USAGE ON SEQUENCE public.doctors_id_seq TO authenticated;

-- 11. Auto-create profile trigger
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
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    updated_at = CURRENT_TIMESTAMP;
  RETURN new;
END;
$$;

-- 12. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();