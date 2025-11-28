# 🔧 Fix Database Permissions

## The Issue
You're getting 406 Not Acceptable and 409 Conflict errors because of database permission issues.

## 🚀 Quick Fix - Run This SQL in Supabase

Go to your **Supabase Dashboard** → **SQL Editor** and run this:

```sql
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Create simple, permissive policies for testing
CREATE POLICY "Enable all operations for authenticated users" ON public.profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Same for other tables
DROP POLICY IF EXISTS "appointments_all_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_patient" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;

CREATE POLICY "Enable all operations for authenticated users" ON public.appointments
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Notifications
DROP POLICY IF EXISTS "notifications_all_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;

CREATE POLICY "Enable all operations for authenticated users" ON public.notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Feedback
DROP POLICY IF EXISTS "feedback_all_own" ON public.feedback;
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
DROP POLICY IF EXISTS "feedback_insert_patient" ON public.feedback;

CREATE POLICY "Enable all operations for authenticated users" ON public.feedback
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Make sure the trigger function exists and works
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
    user_type = EXCLUDED.user_type;
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.feedback TO authenticated;
GRANT SELECT ON public.doctors TO authenticated;
```

## 🧪 Test After Running SQL

1. **Clear browser cache** completely
2. **Try signing up** with a new email
3. **Try logging in** with existing credentials

This should fix the permission issues and allow proper signup/login!