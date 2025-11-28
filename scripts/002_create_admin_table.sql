-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[] DEFAULT ARRAY['view_users', 'view_appointments', 'manage_doctors'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin RLS Policies
CREATE POLICY "admin_select_own" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_insert_super_admin_only" ON public.admin_users FOR INSERT WITH CHECK (FALSE);
CREATE POLICY "admin_update_super_admin_only" ON public.admin_users FOR UPDATE USING (FALSE);
