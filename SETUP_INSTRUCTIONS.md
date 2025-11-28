# Health Appointment System - Setup Instructions

## Issues Fixed

✅ **Authentication Issues**: 
- Added missing auth callback handler (`/auth/callback/route.ts`)
- Created auth error page for failed email verification
- Fixed signup → login flow

✅ **Check-in/Check-out Functionality**:
- Patients can now check-in to their appointments
- Doctors can check-out and complete appointments with notes
- Added proper status tracking (scheduled → checked_in → completed)

✅ **Feedback/Rating System**:
- Patients can rate and review doctors after completed appointments
- Doctors can view their ratings and reviews
- Added feedback API endpoints
- Created DoctorRatings component

## Database Schema Updates

The following tables have been updated/added:

1. **appointments** table:
   - Added `check_in_time` and `check_out_time` columns
   - Updated status to include `checked_in` state

2. **feedback** table (new):
   - Stores patient ratings (1-5 stars) and reviews
   - Links to appointments and doctors
   - One feedback per appointment

## Setup Instructions

1. **Environment Variables**: Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Database Setup**: Run the SQL schema from `scripts/001_create_schema.sql` in your Supabase database

3. **Start the Application**:
   ```bash
   npm run dev
   ```

## How to Test

1. **Sign Up**: Create a new patient or doctor account
2. **Email Verification**: Check your email and click the verification link
3. **Login**: Use your credentials to log in
4. **Book Appointment**: As a patient, book an appointment
5. **Check In**: As a patient, check in to your appointment
6. **Check Out**: As a doctor, complete the appointment with notes
7. **Leave Feedback**: As a patient, rate and review the doctor
8. **View Feedback**: As a doctor, see your ratings and reviews

## Features Working

- ✅ User registration and email verification
- ✅ Login/logout functionality
- ✅ Patient and doctor dashboards
- ✅ Appointment booking
- ✅ Check-in functionality (patients)
- ✅ Check-out functionality (doctors)
- ✅ Feedback and rating system
- ✅ Real-time status updates
- ✅ Responsive UI with modern design
