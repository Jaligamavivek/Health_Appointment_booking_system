# 🔄 Complete Reset Guide

## Step 1: Clear All Browser Data
1. **Open Chrome/Edge** → Press **Ctrl+Shift+Delete**
2. **Select "All time"**
3. **Check all boxes** (cookies, cache, site data, etc.)
4. **Click "Clear data"**
5. **Restart browser**

## Step 2: Reset Supabase Database
Run this SQL in your **Supabase SQL Editor**:

```sql
-- Delete all data from tables
DELETE FROM public.feedback;
DELETE FROM public.notifications;
DELETE FROM public.appointments;
DELETE FROM public.profiles;
DELETE FROM public.doctors;

-- Delete all auth users (this clears login cache)
DELETE FROM auth.users;

-- Reset sequences
ALTER SEQUENCE public.doctors_id_seq RESTART WITH 1;

-- Recreate sample doctors
INSERT INTO public.doctors (name, specialization, available_days, available_time) VALUES
('Dr. Ananya Sharma', 'Cardiologist', 'Mon-Fri', '09:00-17:00'),
('Dr. Rajesh Kumar', 'Dermatologist', 'Mon-Sat', '08:00-16:00'),
('Dr. Priya Patel', 'Pediatrician', 'Tue-Sat', '10:00-18:00'),
('Dr. Amit Singh', 'Orthopedic', 'Mon-Fri', '09:00-15:00'),
('Dr. Kavya Reddy', 'Gynecologist', 'Mon-Wed,Fri', '11:00-19:00');
```

## Step 3: Disable Authentication Temporarily
This will let you test everything without auth issues.

## Step 4: Test Everything
Go to: http://localhost:3000/test-dashboard