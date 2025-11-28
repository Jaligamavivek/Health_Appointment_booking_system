# 🚀 Simple Working Setup

## Step 1: Reset Everything

### Clear Browser Data:
1. **Ctrl+Shift+Delete** → Clear all data → Restart browser

### Reset Database:
Run this in **Supabase SQL Editor**:
```sql
-- Clear all data
DELETE FROM public.feedback;
DELETE FROM public.notifications; 
DELETE FROM public.appointments;
DELETE FROM public.profiles;
DELETE FROM public.doctors;
DELETE FROM auth.users;

-- Reset and add sample doctors
ALTER SEQUENCE public.doctors_id_seq RESTART WITH 1;
INSERT INTO public.doctors (name, specialization, available_days, available_time) VALUES
('Dr. Ananya Sharma', 'Cardiologist', 'Mon-Fri', '09:00-17:00'),
('Dr. Rajesh Kumar', 'Dermatologist', 'Mon-Sat', '08:00-16:00'),
('Dr. Priya Patel', 'Pediatrician', 'Tue-Sat', '10:00-18:00');
```

## Step 2: Test Without Authentication

### Go to Test Dashboard:
**http://localhost:3000/test-dashboard**

### Test Patient Features:
1. **Click "Test as Patient"**
2. **Click "Book Appointment"** button
3. **Select doctor, date, time**
4. **Submit** - should work without 401 errors

### Test Doctor Features:
1. **Click "Test as Doctor"**
2. **View appointments**
3. **Check-out patients**

## Step 3: Expected Results

✅ **No 401 Unauthorized errors**
✅ **Appointments can be booked**
✅ **Patient and doctor dashboards work**
✅ **All features functional**

## Step 4: Re-enable Authentication Later

Once everything works in test mode, we can re-enable authentication by:
1. Uncommenting the auth checks in API files
2. Setting up proper user accounts
3. Testing real login flow

This approach lets you verify all features work before dealing with auth complexity!