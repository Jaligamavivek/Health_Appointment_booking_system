# Login Troubleshooting Guide

## 🚨 **Common Login Issues & Solutions**

### **Issue 1: "Invalid login credentials"**
**Causes:**
- Wrong email or password
- User doesn't exist in auth.users table
- Email not confirmed

**Solutions:**
1. Check if user exists in Supabase Dashboard > Authentication > Users
2. Verify email is confirmed (green checkmark)
3. Try resetting password

### **Issue 2: "Profile not found"**
**Causes:**
- User exists in auth.users but not in profiles table
- Database trigger didn't fire
- RLS policies blocking access

**Solutions:**
1. Check if profiles table exists
2. Run the database schema script
3. Manually create profile record

### **Issue 3: "Email not confirmed"**
**Causes:**
- User signed up but didn't click verification link
- Email verification disabled

**Solutions:**
1. Check email for verification link
2. Resend verification email
3. Confirm email in Supabase Dashboard

## 🔧 **Step-by-Step Debugging**

### **Step 1: Check Database Setup**
Run this in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'doctors', 'appointments');

-- Check if users exist
SELECT id, email, email_confirmed_at FROM auth.users;

-- Check if profiles exist
SELECT id, email, user_type FROM public.profiles;
```

### **Step 2: Test Authentication**
1. Go to `/auth-test` page
2. Try logging in with test credentials
3. Check browser console for errors
4. Check Supabase logs

### **Step 3: Create Test User**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Confirm email
6. Check if profile is created automatically

### **Step 4: Manual Profile Creation**
If profile isn't created automatically:
```sql
-- Replace 'user-uuid' with actual user ID
INSERT INTO public.profiles (id, first_name, last_name, email, user_type)
VALUES (
  'user-uuid-here',
  'Test',
  'User',
  'test@example.com',
  'patient'
);
```

## 📋 **Quick Fixes**

### **Fix 1: Reset Everything**
```sql
-- Drop and recreate profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate with proper structure
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'patient')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### **Fix 2: Environment Variables**
Check `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Fix 3: RLS Policies**
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🧪 **Test Credentials**

Create these test users in Supabase Dashboard:

**Patient:**
- Email: `patient@test.com`
- Password: `password123`
- Type: `patient`

**Doctor:**
- Email: `doctor@test.com`
- Password: `password123`
- Type: `doctor`

## 📞 **Still Having Issues?**

1. Check browser console for errors
2. Check Supabase logs in Dashboard
3. Use `/auth-test` page to debug
4. Verify all environment variables are set
5. Make sure database schema is correct

The most common issue is missing profiles table or incorrect RLS policies!
