-- Sample doctors data for testing
-- Run this after creating the main schema

-- Insert sample doctor profiles
INSERT INTO public.profiles (id, first_name, last_name, email, user_type) VALUES
('11111111-1111-1111-1111-111111111111', 'John', 'Smith', 'dr.smith@example.com', 'doctor'),
('22222222-2222-2222-2222-222222222222', 'Sarah', 'Johnson', 'dr.johnson@example.com', 'doctor'),
('33333333-3333-3333-3333-333333333333', 'Michael', 'Brown', 'dr.brown@example.com', 'doctor')
ON CONFLICT (id) DO NOTHING;

-- Insert sample doctors
INSERT INTO public.doctors (id, specialization, bio, license_number, available_from, available_to) VALUES
('11111111-1111-1111-1111-111111111111', 'Cardiology', 'Experienced cardiologist with 15 years of practice', 'CARD001', '09:00', '17:00'),
('22222222-2222-2222-2222-222222222222', 'Dermatology', 'Board-certified dermatologist specializing in skin conditions', 'DERM001', '08:00', '16:00'),
('33333333-3333-3333-3333-333333333333', 'Pediatrics', 'Pediatrician focused on child health and development', 'PED001', '10:00', '18:00')
ON CONFLICT (id) DO NOTHING;
