-- Test user creation script
-- Run this in your Supabase SQL editor to create test users

-- First, let's check if we have any existing users
SELECT * FROM auth.users;
SELECT * FROM public.profiles;

-- Create a test patient user (you'll need to do this through Supabase Auth UI or API)
-- But first, let's make sure the profiles table exists and has the right structure

-- Check if profiles table exists and has data
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  p.user_type,
  u.email_confirmed_at,
  u.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id;

-- If no users exist, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" 
-- 3. Create a user with email and password
-- 4. The trigger should automatically create a profile

-- Or use this to manually create a profile for an existing auth user:
-- (Replace the UUID with an actual user ID from auth.users)

-- INSERT INTO public.profiles (id, first_name, last_name, email, user_type)
-- VALUES (
--   'your-user-uuid-here',
--   'Test',
--   'Patient',
--   'test@example.com',
--   'patient'
-- );
